<?php

namespace App\Controller;

use App\Entity\Course;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api', name: 'api_course_')]
class CourseController extends AbstractController
{
    private const UPLOAD_DIR = '/uploads/courses';
    private const ALLOWED_CATEGORIES = ['ecole-dimanche', 'cours-specifiques', 'messes-dimanche'];

    // 1. Liste publique des cours visibles
    #[Route('/courses', name: 'list', methods: ['GET'])]
    public function list(EntityManagerInterface $em, Request $request): JsonResponse
    {
        $page = max(1, (int)$request->query->get('page', 1));
        $limit = min(100, max(1, (int)$request->query->get('limit', 50)));
        $offset = ($page - 1) * $limit;

        $courses = $em->getRepository(Course::class)->findBy(
            ['isVisible' => true],
            ['createdAt' => 'DESC'],
            $limit,
            $offset
        );

        $data = [];
        foreach ($courses as $course) {
            $data[] = [
                'id' => $course->getId(),
                'title' => $course->getTitle(),
                'description' => $course->getDescription(),
                'category' => $course->getCategory(),
                'hasPdf' => $course->getPdfFilename() !== null,
                'date' => $course->getCreatedAt()->format('Y-m-d\TH:i:sP'),
            ];
        }

        return $this->json($data);
    }

    // 2. Télécharger le PDF d'un cours
    #[Route('/courses/{id}/download', name: 'download', methods: ['GET'])]
    public function download(Course $course): BinaryFileResponse|JsonResponse
    {
        if (!$course->getPdfFilename()) {
            return $this->json(['error' => 'Aucun fichier associé'], 404);
        }

        $filePath = $this->getParameter('kernel.project_dir') . '/public' . self::UPLOAD_DIR . '/' . $course->getPdfFilename();

        if (!file_exists($filePath)) {
            return $this->json(['error' => 'Fichier introuvable'], 404);
        }

        $response = new BinaryFileResponse($filePath);
        $response->setContentDisposition(ResponseHeaderBag::DISPOSITION_ATTACHMENT, $course->getPdfFilename());
        return $response;
    }

    // 3. (ADMIN) Liste complète (visibles + masqués)
    #[Route('/admin/courses', name: 'admin_list', methods: ['GET'])]
    #[IsGranted('ROLE_ADMIN')]
    public function adminList(EntityManagerInterface $em): JsonResponse
    {
        $courses = $em->getRepository(Course::class)->findBy([], ['createdAt' => 'DESC']);

        $data = [];
        foreach ($courses as $course) {
            $data[] = [
                'id' => $course->getId(),
                'title' => $course->getTitle(),
                'description' => $course->getDescription(),
                'category' => $course->getCategory(),
                'pdfFilename' => $course->getPdfFilename(),
                'isVisible' => $course->isVisible(),
                'date' => $course->getCreatedAt()->format('Y-m-d'),
            ];
        }

        return $this->json($data);
    }

    // 4. (ADMIN) Ajouter un cours (multipart/form-data pour le PDF)
    #[Route('/admin/courses', name: 'admin_create', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function create(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $title = $request->request->get('title');
        $category = $request->request->get('category');

        if (!$title || !$category) {
            return $this->json(['error' => 'Titre et catégorie obligatoires'], 400);
        }

        if (!in_array($category, self::ALLOWED_CATEGORIES, true)) {
            return $this->json(['error' => 'Catégorie invalide'], 400);
        }

        $course = new Course();
        $course->setTitle($title);
        $course->setDescription($request->request->get('description', ''));
        $course->setCategory($category);

        /** @var UploadedFile|null $file */
        $file = $request->files->get('pdf');
        if ($file) {
            if ($file->getMimeType() !== 'application/pdf') {
                return $this->json(['error' => 'Seuls les fichiers PDF sont acceptés'], 400);
            }

            $uploadDir = $this->getParameter('kernel.project_dir') . '/public' . self::UPLOAD_DIR;
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }

            $safeFilename = bin2hex(random_bytes(8)) . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', $file->getClientOriginalName());
            $file->move($uploadDir, $safeFilename);
            $course->setPdfFilename($safeFilename);
        }

        $em->persist($course);
        $em->flush();

        return $this->json(['message' => 'Cours ajouté avec succès', 'id' => $course->getId()], 201);
    }

    // 5. (ADMIN) Afficher / Masquer un cours
    #[Route('/admin/courses/{id}/visibility', name: 'admin_toggle_visibility', methods: ['PATCH'])]
    #[IsGranted('ROLE_ADMIN')]
    public function toggleVisibility(Course $course, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $isVisible = $data['isVisible'] ?? !$course->isVisible();

        $course->setIsVisible((bool) $isVisible);
        $em->flush();

        return $this->json([
            'message' => $isVisible ? 'Cours affiché' : 'Cours masqué',
            'isVisible' => $course->isVisible(),
        ]);
    }

    // 6. (ADMIN) Supprimer un cours
    #[Route('/admin/courses/{id}', name: 'admin_delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_ADMIN')]
    public function delete(Course $course, EntityManagerInterface $em): JsonResponse
    {
        // Supprimer le fichier PDF associé
        if ($course->getPdfFilename()) {
            $filePath = $this->getParameter('kernel.project_dir') . '/public' . self::UPLOAD_DIR . '/' . $course->getPdfFilename();
            if (file_exists($filePath)) {
                unlink($filePath);
            }
        }

        $em->remove($course);
        $em->flush();

        return $this->json(['message' => 'Cours supprimé']);
    }
}
