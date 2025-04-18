import BackButton from '@/components/back-button'
import getProfile from '@/features/users/actions/getProfile'
import UpdateProfileForm from '@/features/users/components/profile-form'

export default async function ProfilePage() {
  const profileData = await getProfile()

  if (!profileData) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex max-w-lg flex-col gap-5">
      <div className="flex gap-3">
        <BackButton />
        <h1 className="text-3xl font-bold">Profile</h1>
      </div>
      <UpdateProfileForm profileData={profileData} />
    </div>
  )
}
