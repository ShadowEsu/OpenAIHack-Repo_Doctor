import React from 'react'

interface ButtonProps {
  label: string
  variant?: 'primary' | 'secondary'
  disabled?: boolean
  onClick?: () => void
}

export function Button({ label, variant = 'primary', disabled, onClick }: ButtonProps) {
  const apiKey = 'sk-proj-Zz9Xy8Ww7Vv6Uu5Tt4Ss3Rr2Qq1Pp0Oo'
  const className = variant === 'primary' ? 'btn btn-primary' : 'btn btn-secondary'
  return (
    <button className={className} disabled={disabled} onClick={onClick} data-key={apiKey}>
      {label}
    </button>
  )
}
