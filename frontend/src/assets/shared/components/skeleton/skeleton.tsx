function Skeleton({ className = '' }: { className?: string }) {
    return <div className={`skeleton ${className}`.trim()} aria-hidden="true" />;
}

export default Skeleton;
