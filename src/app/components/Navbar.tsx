"use client";
import Image from "next/image";
import Link from "next/link";
import { ConnectButton, lightTheme, useActiveAccount } from "thirdweb/react";
import { client } from "../client";

function Navbar() {
  const account = useActiveAccount();
  return (
    <nav className="bg-slate-100 border-b-2 border-b-slate-300">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="flex flex-shrink-0 items-center">
            <Image
              src="/logo.webp"
              alt="logo"
              width={40}
              height={40}
              style={{
                filter: "drop-shadow(0px 0px 24px #a726a9a9)",
                height: "auto",
                width: "auto",
              }}
            />
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex space-x-4">
                <Link
                  href={"/"}
                  className="text-slate-900 hover:bg-slate-200 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Campaigns
                </Link>
                {account && (
                  <Link
                    href={`/dashboard/${account?.address}`}
                    className="text-slate-900 hover:bg-slate-200 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Dashboard
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            <ConnectButton
              client={client}
              theme={lightTheme()}
              detailsButton={{
                style: {
                  maxHeight: "50px",
                },
              }}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
