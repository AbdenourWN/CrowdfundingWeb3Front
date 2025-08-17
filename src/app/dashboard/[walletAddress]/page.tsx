"use client";
import { client } from "@/app/client";
import CampaignCard from "@/app/components/CampaignCard";
import { CRWODFUNDING_FACTORY } from "@/app/contracts/contracts";
import { use, useState } from "react";
import { getContract } from "thirdweb";
import { sepolia } from "thirdweb/chains";
import { deployPublishedContract } from "thirdweb/deploys";
import { useActiveAccount, useReadContract } from "thirdweb/react";

function DashboardPage() {
  const account = useActiveAccount();
  const contract = getContract({
    client: client,
    chain: sepolia,
    address: CRWODFUNDING_FACTORY,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data, isPending } = useReadContract({
    contract,
    method:
      "function getUserCampaigns(address _user) view returns ((address campaignAddress, address owner, string name, uint256 creationTime)[])",
    params: [account?.address as string],
  });
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-16">
      <div className="flex flex-row justify-between items-center mb-8">
        <p className="text-4xl font-bold">Dashboard</p>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-md"
          onClick={() => setIsModalOpen(true)}
        >
          Create Campaign
        </button>
      </div>
      <p className="text-2xl font-bold mb-4">My Campaigns: </p>
      <div className="grid grid-cols-3 gap-4">
        {!isPending &&
          data &&
          (data && data?.length > 0 ? (
            data.map((campaign, index: number) => (
              <CampaignCard
                key={index}
                campaignAddress={campaign.campaignAddress}
              />
            ))
          ) : (
            <p>No campaigns found</p>
          ))}
      </div>
      {isModalOpen && <CreateCampaignModal setIsModalOpen={setIsModalOpen} />}
    </div>
  );
}

type CreateCampaignModalProps = {
  setIsModalOpen: (isModalOpen: boolean) => void;
};

const CreateCampaignModal = ({ setIsModalOpen }: CreateCampaignModalProps) => {
  const account = useActiveAccount();
  const [campaignName, setCampaignName] = useState<string>("");
  const [campaignDescription, setCampaignDescription] = useState<string>("");
  const [campaignGoal, setCampaignGoal] = useState<number>(0);
  const [campaignDeadline, setCampaignDeadline] = useState<number>(0);
  const [isDeployingContract, setIsDeployingContract] =
    useState<boolean>(false);
  const [errorForm, setErrorForm] = useState<any>(null);

  const handleDeployContract = async () => {
    if (
      campaignName === "" ||
      campaignDescription === "" ||
      campaignGoal === 0 ||
      campaignDeadline === 0
    ) {
      setErrorForm("All fields are required");
    } else {
      setIsDeployingContract(true);
      setErrorForm(null);
      try {
        const contractAddress = await deployPublishedContract({
          client: client,
          chain: sepolia,
          account: account!,
          contractId: "Crowdfunding",
          contractParams: {
            _name: campaignName,
            _description: campaignDescription,
            _goal: campaignGoal,
            _durationInDays: campaignDeadline,
          },
          publisher: "0xB357314beCc756859bAF2976A59D00658C94F296",
          version: "1.0.2",
        });
        console.log(errorForm);
        alert("Campaign created successfully!");
        setIsDeployingContract(false);
        setIsModalOpen(false);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleReset = () => {
    setIsDeployingContract(false);
    setErrorForm(null);
    setIsModalOpen(false);
  };

  const handleCampaignGoal = (value: number) => {
    if (value < 1) {
      setCampaignGoal(1);
    } else {
      setCampaignGoal(value);
    }
  };

  const handleCampaignLength = (value: number) => {
    if (value < 1) {
      setCampaignDeadline(1);
    } else {
      setCampaignDeadline(value);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center backdrop-blur-md">
      <div className="w-1/2 bg-slate-100 p-6 rounded-md">
        <div className="flex justify-between items-center mb-4">
          <p className="text-lg font-bold">Create a Campaign</p>
          <button
            className="text-sm px-4 py-2 bg-slate-600 text-white rounded-md"
            onClick={handleReset}
          >
            Close
          </button>
        </div>
        <div className="flex flex-col">
          <label htmlFor="campaignName">Campaign Name:</label>
          <input
            required
            type="text"
            id="campaignName"
            name="campaignName"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            placeholder="Campaign Name"
            className="mb-4 px-4 py-2 bg-slate-200 rounded-md"
          />
          <label htmlFor="description">Campaign Description</label>
          <textarea
            name="description"
            id="description"
            value={campaignDescription}
            onChange={(e) => setCampaignDescription(e.target.value)}
            placeholder="Campaign Description"
            className="mb-4 px-4 py-2 bg-slate-200 rounded-md"
          ></textarea>
          <label htmlFor="goal">Campaign Goal</label>
          <input
            required
            type="number"
            value={campaignGoal}
            onChange={(e) => handleCampaignGoal(parseInt(e.target.value))}
            className="mb-4 px-4 py-2 bg-slate-200 rounded-md"
            id="goal"
            name="goal"
          />
          <label htmlFor="deadline">{`Campaign Length (Days)`}</label>
          <div className="flex space-x-4">
            <input
              required
              type="number"
              className="mb-4 px-4 py-2 bg-slate-200 rounded-md"
              value={campaignDeadline}
              onChange={(e) => handleCampaignLength(parseInt(e.target.value))}
            />
          </div>
          {errorForm && (
            <p className="text-red-700 bg-red-100 px-4 py-2 rounded-md">
              {errorForm}
            </p>
          )}
          <button
            className={`px-4 py-2  text-white rounded-md mt-4 ${
              isDeployingContract ? "bg-blue-400" : "bg-blue-600"}`}
            onClick={handleDeployContract}
            disabled={isDeployingContract}
          >
            {isDeployingContract ? "Creating Campaign..." : "Create Campaign"}
          </button>
        </div>
      </div>
    </div>
  );
};
export default DashboardPage;
