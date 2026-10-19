'use client';

// Template Lifecycle Component (FST Unit 1: Template files vs layouts)
export default function PublicTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="animate-in fade-in duration-300">
      {children}
    </div>
  );
}
