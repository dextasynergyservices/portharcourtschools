import { Skeleton } from "@/components/ui/skeleton";

export default function SchoolsLoading() {
  return (
    <div className="min-h-screen bg-[#FAFBFF]">
      {/* Header Banner Skeleton */}
      <section className="bg-gradient-to-b from-[#EEF2FA] to-[#FAFBFF] border-b border-[#D9DEEC] py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <Skeleton className="h-4 w-32 rounded-full" />
          <Skeleton className="h-10 sm:h-12 w-3/4 max-w-xl rounded-lg" />
          <Skeleton className="h-5 w-full max-w-2xl rounded-md" />
        </div>
      </section>

      {/* Filter Bar Skeleton */}
      <section className="sticky top-20 z-20 bg-white/95 backdrop-blur-md border-b border-[#D9DEEC] py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-28 rounded-lg" />
            <Skeleton className="h-10 w-28 rounded-lg" />
            <Skeleton className="h-10 w-24 rounded-lg" />
          </div>
        </div>
      </section>

      {/* Schools Grid Skeleton */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-5 w-44 rounded-md" />
          <Skeleton className="h-8 w-32 rounded-md" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            "school-skel-1",
            "school-skel-2",
            "school-skel-3",
            "school-skel-4",
            "school-skel-5",
            "school-skel-6",
            "school-skel-7",
            "school-skel-8",
            "school-skel-9",
          ].map((key) => (
            <div
              key={key}
              className="flex flex-col justify-between bg-white border border-[#D9DEEC] rounded-xl overflow-hidden shadow-xs"
            >
              <div>
                {/* Image Placeholder */}
                <Skeleton className="h-44 w-full rounded-none" />

                {/* Content */}
                <div className="p-5 space-y-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <Skeleton className="h-4 w-28 rounded-full" />
                    <Skeleton className="h-4 w-20 rounded-full" />
                  </div>

                  <Skeleton className="h-6 w-4/5 rounded-md" />

                  <div className="flex items-center gap-2 pt-1">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-3/5 rounded-md" />
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    <Skeleton className="h-5 w-16 rounded-md" />
                    <Skeleton className="h-5 w-20 rounded-md" />
                    <Skeleton className="h-5 w-14 rounded-md" />
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-5 pt-0 flex items-center gap-2">
                <Skeleton className="h-9 w-full rounded-lg" />
                <Skeleton className="size-9 rounded-md shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
