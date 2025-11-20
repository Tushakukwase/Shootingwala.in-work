"use client"

interface PasswordStrengthIndicatorProps {
  password: string
}

export default function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const calculateStrength = () => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[^a-zA-Z\d]/.test(password)) strength++
    return strength
  }

  const strength = calculateStrength()
  const strengthLabels = ["Weak", "Fair", "Good", "Strong", "Very Strong"]
  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500", "bg-green-600"]

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition ${
              i < strength ? strengthColors[strength - 1] : "bg-slate-200 dark:bg-slate-700"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-slate-600 dark:text-slate-400">
        Password strength:{" "}
        <span className="font-semibold">{strengthLabels[strength - 1] || "Very Weak"}</span>
      </p>
    </div>
  )
}