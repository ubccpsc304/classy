import * as rp from "request-promise-native";
import Config, {ConfigKey} from "../../../common/Config";
import Log from "../../../common/Log";
import {IAutoTestResult} from "../../../common/types/AutoTestTypes";
import {
    AutoTestAuthTransport, AutoTestConfigPayload,
    AutoTestDefaultDeliverableTransport,
    AutoTestGradeTransport,
    AutoTestPersonIdTransport,
    AutoTestResultTransport,
    Payload
} from "../../../common/types/PortalTypes";
import {IClassPortal} from "../autotest/ClassPortal";

/**
 * TODO: This type should go away once the full portal-backend project is finished and spun up.
 * The SDMM backend instance should be able to provide all of this directly.
 */
export class EdXClassPortal implements IClassPortal {
    private host: string = Config.getInstance().getProp(ConfigKey.backendUrl);
    private port: number = Config.getInstance().getProp(ConfigKey.backendPort);

    public async isStaff(userName: string): Promise<AutoTestAuthTransport> {
        Log.info("EdXClassPortal::isStaff(..) - start");
        const courseId = Config.getInstance().getProp(ConfigKey.name);
        if (courseId === "sdmm") {
            if (userName === "rtholmes") {
                return {personId: userName, isStaff: true, isAdmin: true};
            }
        }
        return {personId: userName, isStaff: false, isAdmin: false};
    }

    public async getDefaultDeliverableId(): Promise<AutoTestDefaultDeliverableTransport | null> {
        Log.info("EdXClassPortal::getDefaultDeliverableId(..) - start");
        // no default deliverable for edx
        return null;
    }

    public async getContainerDetails(delivId: string): Promise<{dockerImage: string, studentDelay: number, maxExecTime: number, regressionDelivIds: string[], custom: object} | null> {
        Log.info("EdXClassPortal::getContainerDetails(..) - start");
        // const courseId = Config.getInstance().getProp(ConfigKey.name);
        // if (typeof courseId !== "undefined" && courseId !== null && typeof delivId !== "undefined" && delivId !== null) {
        //     if (courseId === "sdmm") {
        //         const delay = 60 * 60 * 12; // 12h in seconds
        //         // TODO: update the image and build
        //         return {dockerImage: "310container", studentDelay: delay, maxExecTime: 300, regressionDelivIds: [], custom: {}};
        //     }
        // }
        // return null;
        const url = this.host + ":" + this.port + "/portal/at/container/" + delivId;
        const opts: rp.RequestPromiseOptions = {
            rejectUnauthorized: false, headers: {
                token: Config.getInstance().getProp(ConfigKey.autotestSecret)
            }
        };
        Log.info("ClassPortal::getContainerId(..) - Sending request to " + url);
        return rp(url, opts).then(function(res) {
            Log.trace("ClassPortal::getContainerId( " + delivId + " ) - success; payload: " + res);
            const json: AutoTestConfigPayload = JSON.parse(res);
            if (typeof json.success !== 'undefined') {
                return json.success;
            } else {
                Log.error("ClassPortal::getContainerId(..) - ERROR: " + JSON.stringify(json));
                return null;
            }
        }).catch(function(err) {
            Log.error("ClassPortal::getContainerId(..) - ERROR; url: " + url + "; ERROR: " + err);
            return null;
        });
    }

    public async sendGrade(grade: AutoTestGradeTransport): Promise<Payload> {
        Log.info("EdXClassPortal::getGrade(..) - start");
        return {success: {worked: true}};
    }

    public async sendResult(grade: IAutoTestResult): Promise<Payload> {
        Log.info("EdXClassPortal::sendResult(..) - start");
        return {success: {worked: true}};
    }

    getResult(delivId: string, repoId: string): Promise<AutoTestResultTransport | null> {
        Log.info("EdXClassPortal::getResult(..) - start");
        return null;
    }

    getPersonId(githubId: string): Promise<AutoTestPersonIdTransport | null> {
        // usernames are the same for edX
        return Promise.resolve({personId: githubId});
    }
}

