export default function Header() {
  return (
    <header className="bg-white sticky top-0 z-50 shadow">
      <div className="max-w-4xl mx-auto relative">
        <div className="flex items-center gap-4 px-4 sm:px-10 md:px-20 py-2">
          <img
            src="/images/fitTo100Logo.png"
            alt="Fit to 100 logo"
            className="h-16 object-contain"
          />
          <h1 className="text-3xl font-nunito font-bold text-gray-800 leading-tight">
            Life Expectancy Calculator
          </h1>
        </div>
      </div>
    </header>
  );
}
