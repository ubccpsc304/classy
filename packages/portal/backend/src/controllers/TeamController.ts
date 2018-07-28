import Log from "../../../../common/Log";
import {Deliverable, Person, Team} from "../Types";
import {DatabaseController} from "./DatabaseController";

export class TeamController {

    private db: DatabaseController = DatabaseController.getInstance();

    public async getAllTeams(): Promise<Team[]> {
        Log.info("TeamController::getAllTeams() - start");

        const teams = await this.db.getTeams();
        return teams;
    }

    public async getTeam(name: string): Promise<Team | null> {
        Log.info("TeamController::getAllTeams( " + name + " ) - start");

        const team = await this.db.getTeam(name);
        return team;
    }

    public async getTeamsForPerson(myPerson: Person): Promise<Team[]> {
        Log.info("TeamController::getTeamsForPerson( " + myPerson.id + " ) - start");

        const myTeams: Team[] = [];
        const allTeams = await this.db.getTeams();
        for (const team of allTeams) {
            if (team.personIds.indexOf(myPerson.id) >= 0) {
                myTeams.push(team);
            }
        }

        Log.info("TeamController::getTeamsForPerson( " + myPerson.id + " ) - done; # teams: " + myTeams.length);
        return myTeams;
    }

    public async createTeam(name: string, deliv: Deliverable, people: Person[], custom: any): Promise<Team | null> {
        Log.info("TeamController::createTeam( " + name + ",.. ) - start");

        if (deliv === null) {
            throw new Error("TeamController::createTeam() - null deliverable provided.");
        }

        const existingTeam = await this.getTeam(name);
        if (existingTeam === null) {
            const peopleIds: string[] = people.map((person) => person.id);
            const team: Team = {
                id:        name,
                delivId:   deliv.id,
                URL:       null,
                personIds: peopleIds,
                custom:    custom
            };
            await this.db.writeTeam(team);
            return await this.db.getTeam(name);
        } else {
            Log.info("TeamController::createTeam( " + name + ",.. ) - team exists: " + JSON.stringify(existingTeam));
            return await this.db.getTeam(name);
        }
    }

}
