"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { editUser, getMyProfile } from "@/service/userServices"
import type { EditUserData, User } from "@/types/user-types"
import { toast } from "sonner"
import { User as UserIcon, Edit, Save, X } from "lucide-react"

export default function UserProfileCard() {
  const [loading, setLoading] = useState(false)
  const [fetchingProfile, setFetchingProfile] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [userId, setUserId] = useState<string>("")
  const [formData, setFormData] = useState<EditUserData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await getMyProfile()
      if (response.success && response.data) {
        setUserId(response.data._id)
        setFormData({
          name: response.data.name,
          email: response.data.email,
          password: "",
          confirmPassword: "",
          role: response.data.role,
        })
      } else {
        toast.error(response.error || "Failed to fetch profile")
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
      toast.error("Failed to fetch profile details")
    } finally {
      setFetchingProfile(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // If password is provided, validate it
      if (formData.password && formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match")
        return
      }

      if (formData.password && formData.password.length < 6) {
        toast.error("Password must be at least 6 characters long")
        return
      }

      const updateData: EditUserData = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      }

      // Only include password if it's provided
      if (formData.password) {
        updateData.password = formData.password
        updateData.confirmPassword = formData.confirmPassword
      }

      const response = await editUser(userId, updateData)

      if (response.success) {
        toast.success("Profile updated successfully!")
        setIsEditing(false)
        // Clear password fields
        setFormData(prev => ({
          ...prev,
          password: "",
          confirmPassword: "",
        }))
      } else {
        toast.error(response.error || "Failed to update profile")
      }
    } catch (error) {
      console.error("Failed to update profile:", error)
      toast.error("Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof EditUserData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    // Reset form data to current profile
    fetchProfile()
  }

  if (fetchingProfile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            My Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              My Profile
            </CardTitle>
            <CardDescription>Manage your account information</CardDescription>
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter full name..."
                required
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="user@example.com"
                required
                disabled={!isEditing}
              />
            </div>
          </div>

          {isEditing && (
            <>
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-3">Change Password (Optional)</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      placeholder="Enter new password..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      placeholder="Confirm new password..."
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Leave password fields empty if you don't want to change your password.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={loading} size="sm">
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancelEdit} size="sm">
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </>
          )}

          {!isEditing && (
            <div className="grid gap-4 md:grid-cols-2 pt-2">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Account Status</Label>
                <p className="text-sm text-green-600">Active</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Member Since</Label>
                <p className="text-sm text-muted-foreground">Recently</p>
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
} 