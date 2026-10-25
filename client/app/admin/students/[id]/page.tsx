import { Suspense } from "react";
import type { Metadata } from "next";

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
      <StudentProfileContent params={params} />
    </Suspense>
  );
}
