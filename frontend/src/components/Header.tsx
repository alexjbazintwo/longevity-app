export default function Header() {
  return (
    <header className="bg-white py-7">
      <div className="max-w-4xl mx-auto relative">
        <div className="flex items-center space-x-6 px-4 sm:px-10 md:px-20">
          <div className="w-16 h-16 bg-gray-200 rounded-full" />
          <h1 className="text-2xl font-nunito font-bold text-gray-800">
            Life Expectancy Calculator
          </h1>
        </div>
      </div>
    </header>
  );
}
