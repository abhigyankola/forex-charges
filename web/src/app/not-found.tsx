import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-16 text-center">
      <p className="font-mono text-[14px] font-medium text-muted-foreground">
        404
      </p>
      <h1 className="mt-2 text-[24px] font-semibold tracking-[-0.04em] text-foreground">
        Page not found
      </h1>
      <p className="mt-2 text-[14px] text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-md bg-secondary px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-accent"
      >
        Back to home
      </Link>
    </main>
  );
}
