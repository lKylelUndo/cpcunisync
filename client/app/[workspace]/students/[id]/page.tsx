import { Suspense } from "react";
import type { Metadata } from "next";

import { NonAdminGuard } from "@/components/features/auth/NonAdminGuard";
import { ProfileSkeleton } from "@/components/features/shared/page-skeletons";
import { StudentProfileView } from "@/components/features/students/student-profile-view";

export const metadata: Metadata = {
  title: "Student Profile",
};

interface StudentProfilePageProps {
  params: Promise<{ id: string }>;
}

async function StudentProfileContent({ params }: StudentProfilePageProps) {
  const { id } = await params;

  return <StudentProfileView studentId={id} />;
}

export default function StudentProfilePage({
  params,
}: StudentProfilePageProps) {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <NonAdminGuard>
        <StudentProfileContent params={params} />
      </NonAdminGuard>
    </Suspense>
  );
}
