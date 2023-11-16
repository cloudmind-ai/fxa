import Image from 'next/image';
import firefoxLogo from '../images/firefox-logo-combined.svg';
import './styles/global.css';

// TODO - Replace these placeholders as part of FXA-8227
export const metadata = {
  title: 'Firefox accounts',
  description: 'Firefox accounts',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header
          className="bg-white fixed flex justify-between items-center shadow h-16 left-0 top-0 mx-auto my-0 px-4 py-0 w-full z-10 tablet:h-20"
          role="banner"
          data-testid="header"
        >
          <Image
            src={firefoxLogo}
            alt="Firefox logo"
            className="object-contain"
            data-testid="branding"
            width={120}
            height={120}
          />
        </header>
        <main className="mt-16 main-content">{children}</main>
      </body>
    </html>
  );
}
