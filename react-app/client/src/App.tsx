import { useComponentValue } from "@dojoengine/react";
import { Entity } from "@dojoengine/recs";
import { useEffect, useState } from "react";
import "./App.css";
import { Direction } from "./utils";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { useDojo } from "./dojo/useDojo";

function App() {

  // hooks to call the spawn move and geth burner account
  const {
    setup: {
      systemCalls: { spawn, move }, // already return a function (WRITE)
      clientComponents: { Position, Moves }, // already return component (READ)
    },
    account,
  } = useDojo();

  //use state to handle clipboard
  const [clipboardStatus, setClipboardStatus] = useState({
    message: "",
    isError: false,
  });

  // entity id we are syncing
  const entityId = getEntityIdFromKeys([
    BigInt(account?.account.address),
  ]) as Entity;

  // get current component values
  const position = useComponentValue(Position, entityId);
  const moves = useComponentValue(Moves, entityId);

  console.log(moves);

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-sky-200 text-gray-700">
      <div className="text-center w-[800px]">
        <button
          className="border-2 border-gray-400 hover:bg-gray-300 m-2 rounded-full px-4 py-2 transition-colors duration-300"
          onClick={() => account?.create()}
        >
          {account?.isDeploying ? "deploying burner" : "create burner"}
        </button>
        {account && account?.list().length > 0 && (
          <button
            className="border-2 border-gray-400 hover:bg-gray-300 m-2 rounded-full px-4 py-2 transition-colors duration-300"
            onClick={async () => await account?.copyToClipboard()}
          >
            Save Burners to Clipboard
          </button>
        )}
        <button
          className="border-2 border-gray-400 hover:bg-gray-300 m-2 rounded-full px-4 py-2 transition-colors duration-300"
          onClick={handleRestoreBurners}
        >
          Restore Burners from Clipboard
        </button>
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

        <div className="card mt-6 bg-white rounded-lg shadow-md p-4">
          <div className="border-2 border-gray-400 m-2 rounded-full px-4 py-2">
            burners deployed: {account.count}
          </div>
          <div className="border-2 border-gray-400 m-2 rounded-full px-4 py-2">
            select signer:
            <select
              className="ml-2 bg-gray-100 border-none focus:outline-none"
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
          <div>
            <button
              onClick={() => account.clear()}
              className="border-2 border-gray-400 hover:bg-gray-300 m-2 rounded-full px-4 py-2 transition-colors duration-300"
            >
              Clear burners
            </button>
            <p className="text-gray-500 mt-2">
              You will need to Authorise the contracts before you can use a
              burner. See readme.
            </p>
          </div>
        </div>

        <div className="card mt-6 bg-white rounded-lg shadow-md p-4">
          <br />
          <button
            className="border-2 border-gray-400 hover:bg-gray-300 m-2 rounded-full px-4 py-2 transition-colors duration-300"
            onClick={() => spawn(account.account)}
          >
            Spawn
          </button>
          <br />
          <br />
          <div>
            Moves Left: {moves ? `${moves.remaining}` : "Need to Spawn"}
          </div>
          <div>
            Position:{" "}
            {position
              ? `${position.vec.x}, ${position.vec.y}`
              : "Need to Spawn"}
          </div>
          <div>{moves && moves.last_direction}</div>
        </div>
        <br />

        <div className="card mt-6 bg-white rounded-lg shadow-md p-4">
          <div>
            <button
              className="border-2 border-gray-400 hover:bg-gray-300 m-2 rounded-full px-4 py-2 transition-colors duration-300"
              onClick={() =>
                position && position.vec.y > 0
                  ? move(account.account, Direction.Up)
                  : console.log("Reach the borders of the world.")
              }
            >
              Move Up
            </button>
          </div>
          <div>
            <button
              className="border-2 border-gray-400 hover:bg-gray-300 m-2 rounded-full px-4 py-2 transition-colors duration-300"
              onClick={() =>
                position && position.vec.x > 0
                  ? move(account.account, Direction.Left)
                  : console.log("Reach the borders of the world.")
              }
            >
              Move Left
            </button>
            <button
              className="border-2 border-gray-400 hover:bg-gray-300 m-2 rounded-full px-4 py-2 transition-colors duration-300"
              onClick={() => move(account.account, Direction.Right)}
            >
              Move Right
            </button>
          </div>
          <div>
            <button
              className="border-2 border-gray-400 hover:bg-gray-300 m-2 rounded-full px-4 py-2 transition-colors duration-300"
              onClick={() => move(account.account, Direction.Down)}
            >
              Move Down
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
