import Spinner from '@/components/Spinner'

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Spinner className="w-8 h-8 text-bourbon-amber" />
    </div>
  )
}
