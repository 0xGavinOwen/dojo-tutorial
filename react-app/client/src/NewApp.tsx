import { useEffect, useState } from "react";
import { useDojo } from "./dojo/useDojo";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { Entity } from "@dojoengine/recs";
import { useComponentValue } from "@dojoengine/react";
import { Direction } from "./utils";

function NewApp() {
  ////////////////////////////////////////////////////////////////////////////////////////
  const {
    setup: {
      systemCalls: { spawn, move }, // return a function we can use it directly (WRITE)
      clientComponents: { Position, Moves }, // return a client component
    },
    account,
  } = useDojo();

  // getting account address as entityId
  const entityId = getEntityIdFromKeys([
    BigInt(account?.account.address),
  ]) as Entity;

  // (READ) read the value of the client component and store it on a variable
  const position = useComponentValue(Position, entityId);
  const moves = useComponentValue(Moves, entityId);

  //use state to handle clipboard
  const [clipboardStatus, setClipboardStatus] = useState({
    message: "",
    isError: false,
  });
  ////////////////////////////////////////////////////////////////////////////////////////

  // function to handle restore burners
  const handleRestoreBurners = async () => {
    try {
      await account?.applyFromClipboard();
      setClipboardStatus({
        message: "Burners restored successfully!",
        isError: false,
      });
    } catch (error) {
      setClipboardStatus({
        message: `Failed to restore burners from clipboard`,
        isError: true,
      });
    }
  };

  // clear use state message
  useEffect(() => {
    if (clipboardStatus.message) {
      const timer = setTimeout(() => {
        setClipboardStatus({ message: "", isError: false });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [clipboardStatus.message]);

  // useEffect(() =>{
  //   console.log("ENTITY ID IS", account?.account.address)

  // },[account])

  return (
    <div className=" bg-orange-200 min-h-screen flex flex-col items-center justify-center gap-5">
      <div className="text-center border-2 p-10">
        <div className="flex gap-4 items-center justify-center">
          <button onClick={() => account?.create()}> Create Burner</button>
          <button onClick={async () => await account?.copyToClipboard()}>
            {" "}
            Save Burners To Clipboard
          </button>
          <button onClick={handleRestoreBurners}>
            Restore Burners from Clipboard
          </button>
        </div>
        {clipboardStatus.message && (
          <div
            className={`mx-auto mt-4 rounded-md px-4 py-2 ${
              clipboardStatus.isError
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {clipboardStatus.message}
          </div>
        )}
        <h1>burners deployed: {account.count}</h1>
        <div>
          select signer:
          <select
            value={account ? account.account.address : ""}
            onChange={(e) => account.select(e.target.value)}
          >
            {account?.list().map((account, index) => {
              return (
                <option value={account.address} key={index}>
                  {account.address}
                </option>
              );
            })}
          </select>
        </div>
        <button onClick={() => account?.clear()}>Clear burners</button>
      </div>

      <div className="text-center border-2 p-10 flex flex-col gap-2">
        <button onClick={() => spawn(account.account)}>spawn</button>
        <div>Moves Left: {moves ? `${moves.remaining}` : "Need to Spawn"}</div>
        <div>
          Position:{" "}
          {position ? `${position.vec.x}, ${position.vec.y}` : "Need to Spawn"}
        </div>
        <div>{moves && moves.last_direction}</div>
      </div>

      <div className="text-center border-2 p-10 flex flex-col gap-2">
        <button
          onClick={() =>
            position && position.vec.y > 0
              ? move(account.account, Direction.Up)
              : console.log("Reach the borders of the world.")
          }
        >
          move up
        </button>
        <button onClick={() => move(account.account, Direction.Down)}>
          move down
        </button>
        <button
          onClick={() =>
            position && position.vec.x > 0
              ? move(account.account, Direction.Left)
              : console.log("Reach the borders of the world.")
          }
        >
          move left
        </button>
        <button onClick={() => move(account.account, Direction.Right)}>
          move right
        </button>
      </div>
    </div>
  );
}

export default NewApp;
