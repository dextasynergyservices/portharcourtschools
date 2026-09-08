import { Skeleton } from "@/components/ui/skeleton";

export default function BlogLoading() {
  return (
    <div className="min-h-screen bg-[#FAFBFF]">
      {/* Blog Hero Skeleton */}
      <section className="bg-gradient-to-b from-[#EEF2FA] to-[#FAFBFF] border-b border-[#D9DEEC] py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <Skeleton className="h-4 w-28 rounded-full" />
          <Skeleton className="h-10 sm:h-12 w-2/3 max-w-lg rounded-lg" />
          <Skeleton className="h-5 w-full max-w-xl rounded-md" />

          {/* Category tabs skeleton */}
          <div className="flex items-center gap-2 pt-4 overflow-x-auto">
            <Skeleton className="h-8 w-20 rounded-md" />
            <Skeleton className="h-8 w-28 rounded-md" />
            <Skeleton className="h-8 w-32 rounded-md" />
            <Skeleton className="h-8 w-24 rounded-md" />
          </div>
        </div>
      </section>

      {/* Blog Content Skeleton */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Featured Post Hero Skeleton */}
        <div className="bg-white border border-[#D9DEEC] rounded-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          <Skeleton className="lg:col-span-6 h-72 lg:h-[380px] w-full rounded-none" />
          <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <Skeleton className="h-4 w-32 rounded-full" />
              <Skeleton className="h-8 sm:h-10 w-full rounded-lg" />
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-4 w-4/5 rounded-md" />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Skeleton className="size-10 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-24 rounded-md" />
                <Skeleton className="h-3 w-16 rounded-md" />
              </div>
            </div>
          </div>
        </div>

        {/* Post Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            "blog-skel-1",
            "blog-skel-2",
            "blog-skel-3",
            "blog-skel-4",
            "blog-skel-5",
            "blog-skel-6",
          ].map((key) => (
            <div
              key={key}
              className="bg-white border border-[#D9DEEC] rounded-xl overflow-hidden shadow-xs flex flex-col justify-between"
            >
              <div>
                <Skeleton className="h-48 w-full rounded-none" />
                <div className="p-6 space-y-3">
                  <Skeleton className="h-4 w-20 rounded-full" />
                  <Skeleton className="h-6 w-full rounded-md" />
                  <Skeleton className="h-4 w-full rounded-md" />
                  <Skeleton className="h-4 w-3/4 rounded-md" />
                </div>
              </div>
              <div className="p-6 pt-0">
                <Skeleton className="h-4 w-24 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
