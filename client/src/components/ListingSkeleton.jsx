/** Matches ListingItem's shape so the grid does not reflow when data lands. */
export default function ListingSkeleton() {
  return (
    <div aria-hidden='true'>
      <div className='skeleton aspect-[4/3] rounded-card' />
      <div className='mt-3.5 flex flex-col gap-2.5'>
        <div className='skeleton h-5 w-32 rounded-control' />
        <div className='skeleton h-4 w-full rounded-control' />
        <div className='skeleton h-4 w-2/3 rounded-control' />
      </div>
    </div>
  );
}
