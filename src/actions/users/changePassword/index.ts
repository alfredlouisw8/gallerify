'use server'

import bcrypt from 'bcryptjs'

import { createClient } from '@/lib/supabase-server'
import { createSafeAction } from '@/lib/create-safe-action'
import supabase from '@/lib/supabase'

import { ChangePasswordSchema } from './schema'
import { InputType, ReturnType } from './types'

const handler = async (data: InputType): Promise<ReturnType> => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Silahkan login' }
  }

  const { currentPassword, newPassword } = data

  try {
    // Fetch current password hash
    const { data: userRow, error: fetchError } = await supabase
      .from('users')
      .select('id, password')
      .eq('id', user.id)
      .single()

    if (fetchError || !userRow) {
      return { error: 'User not found' }
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      userRow.password as string
    )

    if (!isPasswordValid) {
      return { error: 'Password salah' }
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10)

    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        password: hashedPassword,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userRow.id)
      .select()
      .single()

    if (updateError) throw new Error(updateError.message)

    return { data: updatedUser }
  } catch (error: any) {
    console.error(error.message)
    return { error: error.message || 'Gagal merubah password' }
  }
}

export const changePassword = createSafeAction(ChangePasswordSchema, handler)
