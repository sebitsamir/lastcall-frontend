export function Footer() {
    return (
        <footer className="mt-16 border-t border-border py-7 text-[13px] text-muted-foreground md:mt-[72px]">
            <div className="mx-auto flex w-full max-w-[1200px] flex-wrap justify-between gap-4 px-[clamp(16px,3vw,32px)]">
                <span>© {new Date().getFullYear()} LastCall. Real-time auctions.</span>
                <span>Wallet credit is for demonstration only.</span>
            </div>
        </footer>
    );
}
