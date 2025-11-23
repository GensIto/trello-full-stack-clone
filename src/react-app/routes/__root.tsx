import { Link, Outlet, createRootRoute } from "@tanstack/react-router";

const RootLayout = () => {
  return (
    <>
      <div className='p-2 flex gap-2'>
        <div className='flex items-center justify-between w-full'>
          <Link to='/' className='[&.active]:font-bold'>
            <div className='flex items-center gap-2'>
              <h1 className='text-base leading-6 text-foreground'>Home</h1>
            </div>
          </Link>
        </div>
      </div>
      <hr />
      <div className='py-6 px-8'>
        <Outlet />
      </div>
    </>
  );
};

export const Route = createRootRoute({ component: RootLayout });
