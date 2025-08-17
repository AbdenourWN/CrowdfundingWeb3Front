import { getContract } from "thirdweb";
import { client } from "../client";
import { sepolia } from "thirdweb/chains";
import { useReadContract } from "thirdweb/react";
import { parse } from "path";
import Link from "next/link";

type CampaignCardProps = {
  campaignAddress: string;
};

function CampaignCard({ campaignAddress }: CampaignCardProps) {
  const contract = getContract({
    client: client,
    chain: sepolia,
    address: campaignAddress,
  });

  const { data: campaignName, isPending: isPendingName } = useReadContract({
    contract,
    method: "function name() view returns (string)",
    params: [],
  });

  const { data: campaignDescription, isPending: isPendingDescription } =
    useReadContract({
      contract,
      method: "function description() view returns (string)",
      params: [],
    });

  const { data: goal, isPending: isPendingGoal } = useReadContract({
    contract,
    method: "function goal() view returns (uint256)",
    params: [],
  });

  const { data: balance, isPending: isPendingBalance } = useReadContract({
    contract,
    method: "function getContractBalance() view returns (uint256)",
    params: [],
  });

  const totalBalance = balance?.toString();
  const totalGoal = goal?.toString();
  let balancePercentage =
    (parseInt(totalBalance as string) / parseInt(totalGoal as string)) * 100;
  if (balancePercentage >= 100) {
    balancePercentage = 100;
  }
  return (
    <div className="flex flex-col justify-between max-w-sm p-6 bg-white border border-slate-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
      <div className="">
        {!isPendingBalance && !isPendingGoal && (
          <div className="mb-4">
            <div className="relative w-full h-6 bg-gray-200 rounded-full dark:bg-gray-700">
              <div
                className="h-6 bg-blue-600 rounded-full dark:bg-blue-500 text-right"
                style={{ width: `${balancePercentage?.toString()}%` }}
              >
                <p className="text-black dark:text-white text-xs p-1">
                  ${totalBalance}
                </p>
              </div>
              <p className="absolute top-0 right-0 text-black dark:text-white text-xs p-1">
                {balancePercentage >= 100
                  ? ""
                  : `${balancePercentage?.toFixed(2).toString()}%`}
              </p>
            </div>
          </div>
        )}
        <h5 className="mb-2 text-2xl font-bold tracking-tight dark:text-gray-200">
          {!isPendingName && campaignName}
        </h5>
        <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
          {!isPendingDescription && campaignDescription}
        </p>
      </div>
      <Link href={`/campaign/${campaignAddress}`} passHref={true}>
        <p className="inline-flex items-center py-2 px-3 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 ">
          View Campaign
          <svg
            className="w-4 h-4 ms-2 rtl:rotate-180"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 25 25"
          >
            <path
              fill="white"
              d="m17.5 5.999-.707.707 5.293 5.293H1v1h21.086l-5.294 5.295.707.707L24 12.499l-6.5-6.5z"
              data-name="Right"
            />
          </svg>
        </p>
      </Link>
    </div>
  );
}

export default CampaignCard;
