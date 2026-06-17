import { PostingWizard } from './PostingWizard'

export default function PostPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="font-heading font-bold text-navy text-3xl mb-2">Post a Role on LaunchPad</h1>
          <p className="text-gray-500">Reach thousands of college students actively seeking internships and co-ops.</p>
        </div>
        <PostingWizard />
      </div>
    </div>
  )
}
