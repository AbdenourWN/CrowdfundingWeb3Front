import { prepareContractCall, ThirdwebContract } from "thirdweb";
import { TransactionButton } from "thirdweb/react";

type Tier = {
  name: string;
  amount: number;
  backers: number;
};

type TierCardProps = {
  tier: Tier;
  index: number;
  contract: ThirdwebContract;
  isEditing: boolean;
};

function TierCard({ tier, index, contract, isEditing }: TierCardProps) {
  return (
    <div className="max-w-sm flex flex-col justify-between p-6 bg-white border border-slate-200 rounded-lg shadow">
      <div className="">
        <div className="flex flex-row justify-between items-center">
          <p className="text-2xl font-bold">{tier.name}</p>
          <p className="text-2xl font-bold">${tier.amount.toString()}</p>
        </div>
        <div className="flex flex-row justify-between items-end">
          <p className="text-xs font-semibold">
            Total Backers:{tier.backers.toString()}
          </p>
          <TransactionButton
            transaction={() =>
              prepareContractCall({
                contract,
                method: "function fund(uint256 _tierIndex) payable",
                params: [BigInt(index)],
                value: BigInt(tier.amount),
              })
            }
            onTransactionConfirmed={async () => {
              alert("Funded Successfully");
            }}
            style={{
              marginTop: "1rem",
              backgroundColor: "#2563EB",
              color: "white",
              padding: "0.5rem 1rem",
              borderRadius: "0.375rem",
              cursor: "pointer",
            }}
          >
            Select
          </TransactionButton>
        </div>
      </div>
      {isEditing && (
        <TransactionButton
          transaction={() =>
            prepareContractCall({
              contract,
              method: "function removeTier(uint256 _index)",
              params: [BigInt(index)],
            })
          }
          onTransactionConfirmed={async () => {
            alert("Tier Removed Successfully");
          }}
          style={{
            marginTop: "1rem",
            backgroundColor: "red",
            color: "white",
            padding: "0.5rem 1rem",
            borderRadius: "0.375rem",
            cursor: "pointer",
          }}
        >
          Remove
        </TransactionButton>
      )}
    </div>
  );
}

export default TierCard;
