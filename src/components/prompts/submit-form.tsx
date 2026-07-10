"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CATEGORIES, AI_TOOLS } from "@/types"
import { slugify } from "@/lib/utils"
import { AlertCircle, Upload } from "lucide-react"

export function SubmitForm() {
  const [title, setTitle] = useState("")
  const [promptText, setPromptText] = useState("")
  const [toolUsed, setToolUsed] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [proofImageUrl, setProofImageUrl] = useState("")
  const [proofLink, setProofLink] = useState("")
  const [outcomeText, setOutcomeText] = useState("")
  const [aiModelVersion, setAiModelVersion] = useState("")
  const [licenseType, setLicenseType] = useState("personal")
  const [isPremium, setIsPremium] = useState(false)
  const [price, setPrice] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB")
      return
    }

    setUploading(true)
    setError("")

    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const { error: uploadError } = await supabase.storage
      .from("proof-images")
      .upload(fileName, file)

    if (uploadError) {
      setError("Failed to upload image. Please try again.")
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from("proof-images")
      .getPublicUrl(fileName)

    setProofImageUrl(publicUrl)
    setUploading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!toolUsed) {
      setError("Please select an AI tool")
      return
    }
    if (!category) {
      setError("Please select a category")
      return
    }
    if (!proofImageUrl && !proofLink) {
      setError("You must provide proof (image upload or proof link)")
      return
    }

    if (isPremium) {
      const parsedPrice = parseFloat(price)
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        setError("Please enter a valid price")
        setLoading(false)
        return
      }
    }

    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError("You must be signed in")
      setLoading(false)
      return
    }

    let slug = slugify(title)
    if (!slug) {
      setError("Could not generate a URL slug from the title")
      setLoading(false)
      return
    }

    const { data: existingSlugs } = await supabase
      .from("prompts")
      .select("slug")
      .eq("slug", slug)
      .limit(1)

    if (existingSlugs && existingSlugs.length > 0) {
      slug = `${slug}-${Date.now().toString(36)}`
    }

    const { error: insertError } = await supabase.from("prompts").insert({
      slug,
      user_id: user.id,
      title,
      prompt_text: promptText,
      tool_used: toolUsed,
      ai_model_version: aiModelVersion || null,
      category,
      license_type: licenseType,
      description,
      proof_image_url: proofImageUrl || null,
      proof_link: proofLink || null,
      outcome_text: outcomeText || null,
      is_premium: isPremium,
      price: isPremium ? Math.round(parseFloat(price) * 100) : null,
    })

    if (insertError) {
      setError("Failed to submit prompt. Please try again.")
      setLoading(false)
      return
    }

    router.push(`/prompt/${slug}`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Prompt Title</Label>
        <Input
          id="title"
          placeholder="E.g., 'Midjourney Product Photography Prompt'"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="promptText">Full Prompt Text</Label>
        <Textarea
          id="promptText"
          placeholder="Paste the exact prompt you used..."
          className="min-h-[120px]"
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>AI Tool Used</Label>
          <Select value={toolUsed} onValueChange={setToolUsed}>
            <SelectTrigger>
              <SelectValue placeholder="Select tool" />
            </SelectTrigger>
            <SelectContent>
              {AI_TOOLS.map((tool) => (
                <SelectItem key={tool} value={tool}>
                  {tool}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="aiModelVersion">AI Model Version (Optional)</Label>
          <Input
            id="aiModelVersion"
            placeholder="E.g., 'GPT-4o', 'Claude Sonnet 4.6', 'Midjourney v6.1'"
            value={aiModelVersion}
            onChange={(e) => setAiModelVersion(e.target.value)}
          />
          <p className="text-xs text-zinc-500">
            Helps buyers know which model this prompt was verified on
          </p>
        </div>

        <div className="space-y-2">
          <Label>License Type</Label>
          <Select value={licenseType} onValueChange={setLicenseType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="personal">Personal Use</SelectItem>
              <SelectItem value="commercial">Commercial Use</SelectItem>
              <SelectItem value="resell">Resell Rights</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-zinc-500">
            What buyers can do with this prompt
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Short Description</Label>
        <Textarea
          id="description"
          placeholder="Briefly describe what this prompt does and what makes it effective..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
        <h3 className="mb-3 text-sm font-semibold text-amber-800 dark:text-amber-200">
          Proof of Outcome (Required)
        </h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Upload Proof Image or Screenshot</Label>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={uploading}
                onClick={() => document.getElementById("proof-upload")?.click()}
              >
                <Upload className="h-4 w-4" />
                {uploading ? "Uploading..." : "Choose Image"}
              </Button>
              <input
                id="proof-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              {proofImageUrl && (
                <span className="text-sm text-green-600">Image uploaded</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="proofLink">Or Provide a Proof Link</Label>
            <Input
              id="proofLink"
              type="url"
              placeholder="https://twitter.com/... or https://myproduct.com"
              value={proofLink}
              onChange={(e) => setProofLink(e.target.value)}
            />
            <p className="text-xs text-zinc-500">
              A link to the live product, tweet, sale receipt, or any proof of outcome
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="outcomeText">Stated Outcome (Optional)</Label>
        <Input
          id="outcomeText"
          placeholder="E.g., '$400 in first week' or '10k views on TikTok'"
          value={outcomeText}
          onChange={(e) => setOutcomeText(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <input
          type="checkbox"
          id="isPremium"
          checked={isPremium}
          onChange={(e) => setIsPremium(e.target.checked)}
          className="h-4 w-4 rounded border-zinc-300"
        />
        <div>
          <Label htmlFor="isPremium" className="cursor-pointer">
            Make this a premium prompt
          </Label>
          <p className="text-xs text-zinc-500">
            {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
              ? "Charge for access to this prompt"
              : "Premium prompts are free until Stripe payments are configured (set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)"}
          </p>
        </div>
      </div>

      {isPremium && (
        <div className="space-y-2">
          <Label htmlFor="price">Price (USD)</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0.99"
            placeholder="9.99"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required={isPremium}
          />
        </div>
      )}

      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading ? "Submitting..." : "Submit Prompt"}
      </Button>
    </form>
  )
}
