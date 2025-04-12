"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IconLogout, IconPhone, IconShield, IconUsers, IconPlus, IconX } from "@tabler/icons-react"

const AccountSettings = () => {
  const [emergencyContacts, setEmergencyContacts] = useState([
    { id: 1, type: "Police", icon: IconShield, placeholder: "Nearest Police Station Number" },
    { id: 2, type: "Neighbor", icon: IconUsers, placeholder: "Neighbor's Number" },
  ])

  const addEmergencyContact = () => {
    const newId = emergencyContacts.length + 1
    setEmergencyContacts([
      ...emergencyContacts,
      { id: newId, type: "Custom", icon: IconPhone, placeholder: "Enter contact number" },
    ])
  }

  const removeEmergencyContact = (id: number) => {
    setEmergencyContacts(emergencyContacts.filter((contact) => contact.id !== id))
  }

  return (
    <div className="flex-1 p-6 bg-white dark:bg-neutral-900 overflow-auto">
      <h2 className="text-2xl font-semibold mb-6">Account Settings</h2>
      <Tabs defaultValue="profile" className="max-w-3xl mx-auto">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="logout">Logout</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <img src="/placeholder.svg?height=100&width=100" alt="Profile" className="w-20 h-20 rounded-full" />
              <Button>Change Avatar</Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" placeholder="John" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" placeholder="Doe" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="john@example.com" />
            </div>
            <Button className="w-full">Update Profile</Button>
          </div>
        </TabsContent>
        <TabsContent value="security" className="mt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input id="currentPassword" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input id="confirmPassword" type="password" />
            </div>
            <Button className="w-full">Change Password</Button>
          </div>
        </TabsContent>
        <TabsContent value="notifications" className="mt-6">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Notification Preferences</h3>
            <div className="space-y-4">
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="form-checkbox" />
                <span>Email notifications</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="form-checkbox" />
                <span>Push notifications</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="form-checkbox" />
                <span>SMS notifications</span>
              </label>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium">Phone Notifications</h4>
              <div className="flex items-center space-x-2">
                <IconPhone className="h-5 w-5" />
                <Input type="tel" placeholder="Enter your phone number" />
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium">Emergency Contacts</h4>
              {emergencyContacts.map((contact) => (
                <div key={contact.id} className="flex items-center space-x-2">
                  <contact.icon className="h-5 w-5" />
                  <Input type="tel" placeholder={contact.placeholder} />
                  {contact.id > 2 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEmergencyContact(contact.id)}
                      className="p-0"
                    >
                      <IconX className="h-5 w-5 text-red-500" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" onClick={addEmergencyContact}>
                <IconPlus className="h-5 w-5 mr-2" /> Add More Contacts
              </Button>
            </div>
            <Button className="w-full">Save Preferences</Button>
          </div>
        </TabsContent>
        <TabsContent value="logout" className="mt-6">
          <div className="text-center">
            <IconLogout className="w-16 h-16 mx-auto text-red-500" />
            <h3 className="text-xl font-semibold mt-4">Are you sure you want to log out?</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-2">You will be returned to the login screen.</p>
            <Button variant="destructive" className="mt-6">
              Logout
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AccountSettings

