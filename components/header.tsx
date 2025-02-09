/* eslint-disable @next/next/no-img-element */
const Header = () => {
  return (
    <div className="border-b sticky top-0 z-10 bg-white/75 backdrop-blur-sm">
      <div className="container mx-auto p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <img
            src="/images/logo.png"
            alt="verifi-logo"
            className="aspect-square w-6"
          />
          <div className="font-bold text-md">VeriFi</div>
        </div>
        <div></div>
      </div>
    </div>
  );
};

export default Header;
