import Link from "next/link";
import {
  BuildingIcon,
  CopyCheckIcon,
  FileTextIcon,
  LayoutDashboardIcon,
  RefreshCwIcon,
  ScrollTextIcon,
  ShieldCheckIcon,
  ShieldIcon,
  WebhookIcon,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import { OUTLINE_ACTION, PRIMARY_ACTION } from "./public-action-styles";
import { PublicHeader } from "./public-header";
import { Seal } from "./seal";

interface Feature {
  title: string;
  description: string;
  icon: LucideIcon;
}

// Ordered along the life of a record: how it enters UniSync, how conflicts are
// resolved, and how access and accountability are enforced around it.
const INTAKE_FEATURES: Feature[] = [
  {
    title: "Batch data sync",
    description:
      "ETL loads student records from the college's existing data files, bringing them into UniSync as a managed batch.",
    icon: RefreshCwIcon,
  },
  {
    title: "REST API integration",
    description:
      "External systems submit students through a secured API, so integrations feed the same trusted student records.",
    icon: WebhookIcon,
  },
  {
    title: "Duplicate detection",
    description:
      "Conflicting student entries are grouped for merge or dismissal, keeping one trusted record per student.",
    icon: CopyCheckIcon,
  },
];

const GOVERNANCE_FEATURES: Feature[] = [
  {
    title: "Verified staff accounts",
    description:
      "Administrators review and approve every account before use, so only verified college staff can access student data.",
    icon: ShieldCheckIcon,
  },
  {
    title: "Role-based workspaces",
    description:
      "Administrators, Registrars, and Department Heads each get their own workspace, and departments see only their own students.",
    icon: LayoutDashboardIcon,
  },
  {
    title: "Audit trails & reports",
    description:
      "Every change is logged and turned into enrollment and academic reports for the college.",
    icon: ScrollTextIcon,
  },
];

const FEATURE_CLUSTERS = [
  { label: "Bringing records in", features: INTAKE_FEATURES, startIndex: 1 },
  {
    label: "Keeping records trusted",
    features: GOVERNANCE_FEATURES,
    startIndex: 4,
  },
];

interface Role {
  title: string;
  description: string;
  scope: string;
  icon: LucideIcon;
}

const ROLES: Role[] = [
  {
    title: "Administrator",
    description:
      "Oversight of the whole college, including staff verification and system-wide student records.",
    scope: "Whole college",
    icon: ShieldIcon,
  },
  {
    title: "Registrar",
    description:
      "Central student records, enrollment, and academic reporting across departments.",
    scope: "Across departments",
    icon: FileTextIcon,
  },
  {
    title: "Department Head",
    description:
      "Access limited to the students in their own department, scoped to their programs.",
    scope: "Own department",
    icon: BuildingIcon,
  },
];

export function LandingPage() {
  return (
    <div className="min-h-svh bg-[#f7f9fc] text-[#101f4e] selection:bg-[#f0c14b]/40 selection:text-[#101f4e] dark:bg-[#0a1024] dark:text-slate-100 dark:selection:bg-[#d9a51c]/30 dark:selection:text-white">
      <PublicHeader
        action={
          <>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="px-2.5 text-xs text-[#101f4e] hover:bg-[#1e3a8a]/5 hover:text-[#1e3a8a] sm:px-3 sm:text-sm dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <Link href="/login">Log in</Link>
            </Button>
            <Button
              asChild
              size="sm"
              className={`px-2.5 text-xs sm:px-3 sm:text-sm ${PRIMARY_ACTION}`}
            >
              <Link href="/register">Create account</Link>
            </Button>
          </>
        }
      />

      <main>
        <section className="relative overflow-hidden border-b border-[#1e3a8a]/10 dark:border-white/10">
          {/* Concentric rings echoing the seal, peeking from both edges */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 hidden overflow-hidden lg:block"
          >
            <div className="absolute top-1/2 -left-56 size-[34rem] -translate-y-1/2 rounded-full border border-[#1e3a8a]/10 dark:border-white/5" />
            <div className="absolute top-1/2 -left-32 size-[21rem] -translate-y-1/2 rounded-full border border-[#d9a51c]/20 dark:border-[#f0c14b]/10" />
            <div className="absolute top-1/2 -right-56 size-[34rem] -translate-y-1/2 rounded-full border border-[#1e3a8a]/10 dark:border-white/5" />
            <div className="absolute top-1/2 -right-32 size-[21rem] -translate-y-1/2 rounded-full border border-[#c8102e]/15 dark:border-[#f0c14b]/10" />
          </div>

          <div className="relative mx-auto flex max-w-4xl flex-col items-center px-4 pt-16 pb-20 text-center sm:px-6 sm:pt-24 sm:pb-28 lg:px-8">
            <div className="relative">
              <div
                aria-hidden
                className="absolute -inset-10 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(217,165,28,0.22),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(240,193,75,0.12),transparent_70%)]"
              />
              <Seal size="lg" preload className="relative" />
              <span
                aria-hidden
                className="pointer-events-none absolute -inset-3 rounded-full border border-[#d9a51c]/45 dark:border-[#f0c14b]/30"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute -inset-7 rounded-full border border-[#1e3a8a]/15 dark:border-white/10"
              />
            </div>

            <p className="mt-12 flex items-center gap-4 text-[11px] font-semibold tracking-[0.3em] text-[#8a6508] uppercase dark:text-[#f0c14b]">
              <span aria-hidden className="h-px w-8 bg-[#d9a51c]" />
              Cordova Public College
              <span aria-hidden className="h-px w-8 bg-[#d9a51c]" />
            </p>
            <h1 className="mt-4 text-5xl font-semibold tracking-tighter text-[#101f4e] sm:text-6xl lg:text-7xl dark:text-white">
              CPC UniSync<span aria-hidden className="text-[#d9a51c]">.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-xl leading-8 font-medium text-[#1e3a8a] sm:text-2xl sm:leading-9 dark:text-[#f0c14b]">
              One trusted source of student data for Cordova Public College
            </p>
            <p className="mt-4 text-[11px] font-semibold tracking-[0.3em] text-[#8a6508] uppercase dark:text-[#e5c15a]">
              Servire Populum <span aria-hidden className="mx-1.5 text-[#c8102e] dark:text-[#f0c14b]">·</span> Serve the People
            </p>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
              A unified student information system that keeps enrollment,
              academic records, and student profiles consistent across the
              college&apos;s departments and systems.
            </p>

            <div className="mt-10 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
              <Button
                asChild
                variant="outline"
                size="lg"
                className={`w-full px-7 sm:w-auto ${OUTLINE_ACTION}`}
              >
                <Link href="/login">Log in</Link>
              </Button>
              <Button
                asChild
                size="lg"
                className={`w-full px-7 sm:w-auto ${PRIMARY_ACTION}`}
              >
                <Link href="/register">Create account</Link>
              </Button>
            </div>

            <p className="mt-7 text-[10px] font-medium tracking-[0.32em] text-slate-500 uppercase dark:text-slate-400">
              Batch ETL
              <span aria-hidden className="mx-2 text-[#d9a51c]">·</span>
              Secured API
              <span aria-hidden className="mx-2 text-[#d9a51c]">·</span>
              Full audit trail
            </p>
          </div>
        </section>

        <section
          aria-labelledby="features-heading"
          className="border-b border-[#1e3a8a]/10 bg-white py-20 sm:py-24 dark:border-white/10 dark:bg-[#0c142c]"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-[#1e3a8a] uppercase dark:text-[#f0c14b]">
                <span aria-hidden className="h-px w-6 bg-[#d9a51c]" />
                Capabilities
              </p>
              <h2
                id="features-heading"
                className="mt-3 text-3xl font-semibold tracking-tight text-[#101f4e] sm:text-4xl dark:text-white"
              >
                How it works
              </h2>
              <p className="mt-3 text-base leading-7 text-slate-600 dark:text-slate-300">
                Records come in through batch files or a secured API, are
                checked for duplicates, and stay auditable as staff manage
                them.
              </p>
            </div>

            <div className="mt-14 space-y-12">
              {FEATURE_CLUSTERS.map((cluster) => (
                <div key={cluster.label}>
                  <div className="flex items-center gap-4 border-b border-[#1e3a8a]/10 pb-3 dark:border-white/10">
                    <p className="text-[11px] font-semibold tracking-[0.24em] whitespace-nowrap text-[#8a6508] uppercase dark:text-[#e5c15a]">
                      {cluster.label}
                    </p>
                    <span
                      aria-hidden
                      className="h-px flex-1 bg-linear-to-r from-[#d9a51c]/60 to-transparent"
                    />
                  </div>

                  <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {cluster.features.map((feature, offset) => {
                      const Icon = feature.icon;
                      const index = String(cluster.startIndex + offset).padStart(2, "0");

                      return (
                        <article
                          key={feature.title}
                          className="group relative flex flex-col overflow-hidden rounded-xl border border-[#1e3a8a]/10 bg-[#f7f9fc] p-6 shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-[#d9a51c]/45 hover:shadow-[0_18px_38px_-22px_rgba(16,31,78,0.4)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 dark:border-white/10 dark:bg-[#101a38] dark:hover:border-[#f0c14b]/35"
                        >
                          <span
                            aria-hidden
                            className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-linear-to-r from-[#c8102e] via-[#d9a51c] to-[#1e3a8a] transition-transform duration-300 ease-out group-hover:scale-x-100 motion-reduce:transition-none"
                          />
                          <span
                            aria-hidden
                            className="absolute top-5 right-6 font-mono text-[11px] tracking-[0.2em] text-[#1e3a8a]/35 dark:text-white/25"
                          >
                            {index}
                          </span>
                          <div className="flex size-11 items-center justify-center rounded-lg bg-[#101f4e] text-[#f0c14b] ring-1 ring-[#d9a51c]/50 transition-colors duration-300 group-hover:bg-[#1e3a8a] dark:bg-[#f0c14b]/10 dark:text-[#f0c14b] dark:ring-[#f0c14b]/25 dark:group-hover:bg-[#f0c14b]/15">
                            <Icon aria-hidden className="size-5" />
                          </div>
                          <h3 className="mt-4 text-base font-semibold text-[#101f4e] dark:text-white">
                            {feature.title}
                          </h3>
                          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                            {feature.description}
                          </p>
                        </article>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="built-for-heading" className="py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-[#1e3a8a] uppercase dark:text-[#f0c14b]">
                <span aria-hidden className="h-px w-6 bg-[#c8102e]" />
                Roles
              </p>
              <h2
                id="built-for-heading"
                className="mt-3 text-3xl font-semibold tracking-tight text-[#101f4e] sm:text-4xl dark:text-white"
              >
                One system, three roles
              </h2>
              <p className="mt-3 text-base leading-7 text-slate-600 dark:text-slate-300">
                Access shaped by each role&apos;s responsibilities.
              </p>
            </div>

            <div className="mt-12 overflow-hidden rounded-2xl border border-[#1e3a8a]/10 bg-white shadow-sm dark:border-white/10 dark:bg-[#101a38]">
              {ROLES.map((role) => {
                const Icon = role.icon;

                return (
                  <div
                    key={role.title}
                    className="grid gap-4 border-t border-[#1e3a8a]/10 p-5 transition-colors duration-300 first:border-t-0 hover:bg-[#f7f9fc] sm:grid-cols-[auto_1fr_auto] sm:items-center sm:gap-8 sm:p-6 dark:border-white/10 dark:hover:bg-white/[0.04]"
                  >
                    <div className="flex size-12 items-center justify-center rounded-full bg-[#1e3a8a]/5 text-[#1e3a8a] ring-1 ring-[#d9a51c]/40 dark:bg-[#f0c14b]/10 dark:text-[#f0c14b] dark:ring-[#f0c14b]/25">
                      <Icon aria-hidden className="size-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-[#101f4e] dark:text-white">
                        {role.title}
                      </h3>
                      <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                        {role.description}
                      </p>
                    </div>
                    <span className="w-fit rounded-full border border-[#1e3a8a]/20 px-3 py-1 text-[10px] font-semibold tracking-[0.18em] whitespace-nowrap text-[#1e3a8a] uppercase sm:justify-self-end dark:border-[#f0c14b]/30 dark:text-[#f0c14b]">
                      {role.scope}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#101f4e] text-slate-200 dark:bg-[#070d1f]">
        <div
          aria-hidden
          className="h-px w-full bg-linear-to-r from-transparent via-[#d9a51c]/60 to-transparent"
        />
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="flex items-center gap-4">
            <Seal size="sm" />
            <div>
              <p className="text-sm font-semibold tracking-wide text-white">
                Cordova Public College
              </p>
              <p className="mt-1 text-[10px] font-semibold tracking-[0.24em] text-[#f0c14b] uppercase">
                Servire Populum
              </p>
              <p className="mt-1.5 text-xs text-slate-400">
                Cordova, Cebu, Philippines · Est. 2005
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-400 md:text-right">
            © 2026 CPC UniSync. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
