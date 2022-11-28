import { Socket } from "socket.io-client";
import { DefaultEventsMap } from "@socket.io/component-emitter";
import { AxiosInstance } from "axios";

type Nullable<T> = T | null;

interface UserInterface {
  user_id: string;
  socket: Nullable<Socket<DefaultEventsMap, DefaultEventsMap>>;
  instance: Nullable<AxiosInstance>;
}

const UserData: UserInterface = {
  user_id: "",
  socket: null,
  instance: null,
};

export { UserData };
