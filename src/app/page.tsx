"use client";

import { getContract } from "thirdweb";
import { client } from "./client";
import { sepolia } from "thirdweb/chains";
import { CRWODFUNDING_FACTORY } from "./contracts/contracts";
import { useReadContract } from "thirdweb/react";
import CampaignCard from "./components/CampaignCard";

export default function Home() {
  const contract = getContract({
    client: client,
    chain: sepolia,
    address: CRWODFUNDING_FACTORY,
  });

  const { data: campaigns, isPending } = useReadContract({
    contract,
    method:
      "function getAllCampaigns() view returns ((address campaignAddress, address owner, string name, uint256 creationTime)[])",
    params: [],
  });


  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-4">
      <div className="py-10">
        <h1 className="text-4xl font-bold mb-4">Campaigns :</h1>
        <div className="grid grid-cols-3 gap-4">
          {!isPending &&
            campaigns &&
            (campaigns?.length > 0 ? (
              campaigns.map((campaign, index: number) => (
                <CampaignCard
                  key={index}
                  campaignAddress={campaign.campaignAddress}
                />
              ))
            ) : (
              <p>No campaigns found</p>
            ))}
        </div>
      </div>
    </main>
  );
}
