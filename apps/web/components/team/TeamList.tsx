import { useState } from "react";

import showToast from "@calcom/lib/notification";
import { inferQueryOutput, trpc } from "@calcom/trpc/react";

import TeamListItem from "./TeamListItem";

interface Props {
  teams: inferQueryOutput<"viewer.teams.list">;
}

export default function TeamList(props: Props) {
  const utils = trpc.useContext();

  const [hideDropdown, setHideDropdown] = useState(false);

  function selectAction(action: string, teamId: number) {
    switch (action) {
      case "disband":
        deleteTeam(teamId);
        break;
    }
  }

  const deleteTeamMutation = trpc.useMutation("viewer.teams.delete", {
    async onSuccess() {
      await utils.invalidateQueries(["viewer.teams.list"]);
    },
    async onError(err) {
      showToast(err.message, "error");
    },
  });

  function deleteTeam(teamId: number) {
    deleteTeamMutation.mutate({ teamId });
  }

  return (
    <div>
      <ul className="mb-2 divide-y divide-neutral-200 rounded border bg-white">
        {props.teams.map((team) => (
          <TeamListItem
            key={team?.id as number}
            team={team}
            onActionSelect={(action: string) => selectAction(action, team?.id as number)}
            isLoading={deleteTeamMutation.isLoading}
            hideDropdown={hideDropdown}
            setHideDropdown={setHideDropdown}
          />
        ))}
      </ul>
    </div>
  );
}
