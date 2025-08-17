"use client";

import { client } from "@/app/client";
import TierCard from "@/app/components/TierCard";
import { useParams } from "next/navigation";
import { parse } from "path";
import { useEffect, useState } from "react";
import { getContract, prepareContractCall, ThirdwebContract } from "thirdweb";
import { sepolia } from "thirdweb/chains";
import {
  lightTheme,
  TransactionButton,
  useActiveAccount,
  useReadContract,
} from "thirdweb/react";


export default function CampaignPage() {

  const Status = ["Active", "Successful", "Failed"];
  
  const account = useActiveAccount();
  const { contractAddress } = useParams<{ contractAddress: string }>();
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  useEffect(() => {
    if (!account) {
      setIsEditing(false);
    }
  }, [account]);

  const contract = getContract({
    client: client,
    chain: sepolia,
    address: contractAddress,
  });

  const { data: owner, isPending: isPendingOwner } = useReadContract({
    contract,
    method: "function owner() view returns (address)",
    params: [],
  });

  const { data: state, isPending: isPendingState } = useReadContract({
    contract,
    method: "function state() view returns (uint8)",
    params: [],
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

  const { data: deadline, isPending: isPendingDeadline } = useReadContract({
    contract,
    method: "function deadline() view returns (uint256)",
    params: [],
  });

  const deadlineDate = new Date(
    parseInt(deadline?.toString() as string) * 1000,
  );
  const deadlineDatePassed = deadlineDate < new Date();

  const { data: tiers, isPending: isPendingTiers } = useReadContract({
    contract,
    method:
      "function getTiers() view returns ((string name, uint256 amount, uint256 backers)[])",
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

  if (!contract)
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-4 text-center text-4xl">
        No Campaign Found!
      </div>
    );
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-4">
      <div className="flex flex-col gap-5">
        <div className="flex flex-row justify-between items-center">
          {!isPendingName && (
            <h1 className="text-3xl font-bold">{campaignName}</h1>
          )}
          {owner === account?.address && (
            <div className="flex flex-row gap-5">
              {!isPendingState && isEditing && state !== undefined &&  (
                <div className="bg-gray-500 px-4 py-2 rounded-md text-white font-bold">
                  Status: {Status[state]}
                </div>
              )}
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? "Done" : "Edit"}
              </button>
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <h2 className="text-base font-bold">Description: </h2>
          {!isPendingDescription && (
            <p className=" text-slate-500">{campaignDescription}</p>
          )}
        </div>

        <div className="flex flex-col">
          <h2 className="text-base font-bold">Deadline: </h2>
          {!isPendingDeadline && (
            <p className=" text-slate-500">{deadlineDate.toDateString()}</p>
          )}
        </div>

        <div className="flex flex-col">
          <h2 className="text-base font-bold">
            Campaign Goal: {!isPendingGoal ? `$${goal}` : ""}
          </h2>
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
        </div>
        <div className="flex flex-col">
          <h2 className="text-base font-bold mb-4">Tiers: </h2>
          <div className="grid grid-cols-3 gap-4">
            {isPendingTiers ? (
              <p>Loading Tiers...</p>
            ) : tiers && tiers.length > 0 ? (
              tiers?.map((tier: any, index: number) => (
                <TierCard
                  key={index}
                  tier={tier}
                  index={index}
                  contract={contract}
                  isEditing={isEditing}
                />
              ))
            ) : (
              !isEditing && <p>No Tiers Available</p>
            )}

            {isEditing && (
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={() => setIsModalOpen(true)}
              >
                + Add Tier
              </button>
            )}
          </div>
        </div>
      </div>
      {isModalOpen && (
        <CreateTierModal setIsModalOpen={setIsModalOpen} contract={contract} />
      )}
    </div>
  );
}

type CreateTierModalProps = {
  setIsModalOpen: (isModalOpen: boolean) => void;
  contract: ThirdwebContract;
};

const CreateTierModal = ({
  setIsModalOpen,
  contract,
}: CreateTierModalProps) => {
  const [tierName, setTierName] = useState("");
  const [tierAmount, setTierAmount] = useState(1n);
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center backdrop-blur-md">
      <div className="w-1/2 bg-slate-100 p-6 rounded-md">
        <div className="flex justify-between items-center mb-4">
          <p className="text-lg font-bold">Create a Funding Tier</p>
          <button
            className="text-sm px-4 py-2 bg-slate-600 text-white rounded-md"
            onClick={() => setIsModalOpen(false)}
          >
            Close
          </button>
        </div>
        <div className="flex flex-col">
          <label htmlFor="tierName"> Tier Name: </label>
          <input
            type="text"
            name="tierName"
            id="tierName"
            className="mb-4 px-4 py-2 bg-slate-200 rounded-md"
            placeholder="Tier Name"
            value={tierName}
            onChange={(e) => setTierName(e.target.value)}
          />
          <label htmlFor="tierCost"> Tier Cost: </label>
          <input
            type="number"
            name="tierCost"
            id="tierCost"
            value={parseInt(tierAmount.toString())}
            className="mb-4 px-4 py-2 bg-slate-200 rounded-md"
            placeholder="Tier Cost"
            onChange={(e) => setTierAmount(BigInt(e.target.value))}
          />
          <TransactionButton
            transaction={() =>
              prepareContractCall({
                contract,
                method: "function addTier(string _name, uint256 _amount)",
                params: [tierName, tierAmount],
              })
            }
            onTransactionConfirmed={() => {
              alert("Tier Added Successfully");
              setIsModalOpen(false);
            }}
            theme={lightTheme()}
          >
            Add Tier
          </TransactionButton>
        </div>
      </div>
    </div>
  );
};
