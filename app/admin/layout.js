export const metadata = {
  title: 'Admin Console | Vijay Jewellery Collection',
  description: 'Management portal for orders, catalog, and store settings.',
};

export default function AdminLayout({ children }) {
  return (
    <div className="admin-root-wrapper min-h-screen bg-[#f8f6f2] text-[#1a160d]">
      {children}
    </div>
  );
}
