import Button from './Button.jsx'

export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="text-center py-16">
      <p className="text-red-700 text-sm mb-3">{message}</p>
      {onRetry && <Button onClick={onRetry}>Retry</Button>}
    </div>
  )
}