export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // console.log("AUTH LAYOUT AKTIF");

    return (
        <div className="min-h-screen flex flex-col">
            {children}
        </div>
    );
}
