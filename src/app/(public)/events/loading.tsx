import { Skeleton } from "@/components/ui/skeleton";

export default function EventsLoading() {
  return (
    <div className="min-h-screen bg-[#FAFBFF]">
      {/* Events Hero Skeleton */}
      <section className="bg-gradient-to-b from-[#EEF2FA] to-[#FAFBFF] border-b border-[#D9DEEC] py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <Skeleton className="h-4 w-36 rounded-full" />
          <Skeleton className="h-10 sm:h-12 w-3/4 max-w-xl rounded-lg" />
          <Skeleton className="h-5 w-full max-w-xl rounded-md" />
        </div>
      </section>

      {/* Events Filter + Grid Skeleton */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D9DEEC] pb-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-28 rounded-full" />
            <Skeleton className="h-8 w-64 rounded-md" />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto">
            <Skeleton className="h-8 w-20 rounded-md" />
            <Skeleton className="h-8 w-24 rounded-md" />
            <Skeleton className="h-8 w-24 rounded-md" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            "event-skel-1",
            "event-skel-2",
            "event-skel-3",
            "event-skel-4",
            "event-skel-5",
            "event-skel-6",
          ].map((key) => (
            <div
              key={key}
              className="h-full flex flex-col justify-between bg-white border border-[#D9DEEC] rounded-xl overflow-hidden shadow-xs"
            >
              <div>
                <Skeleton className="h-48 w-full rounded-none" />
                <div className="p-6 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-20 rounded-full" />
                    <Skeleton className="h-4 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-6 w-full rounded-md" />
                  <div className="space-y-2 pt-1">
                    <Skeleton className="h-4 w-3/4 rounded-md" />
                    <Skeleton className="h-4 w-1/2 rounded-md" />
                  </div>
                </div>
              </div>
              <div className="p-6 pt-0">
                <Skeleton className="h-9 w-full rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
