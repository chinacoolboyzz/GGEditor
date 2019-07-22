import { EditorEvent } from '@common/constants';
import { Graph, Command } from '@common/interface';

class CommandManager {
  command: {
    [propName: string]: Command;
  };
  commandQueue: Command[];
  commandIndex: number;

  constructor() {
    this.command = {};
    this.commandQueue = [];
    this.commandIndex = 0;
  }

  /** 注册命令 */
  register = (name: string, command: Command) => {
    this.command[name] = {
      ...command,
      name,
    };
  }

  /** 是否可以执行 */
  canExecute = (graph: Graph, name: string) => {
    return this.command[name].canExecute(graph);
  }

  /** 执行命令 */
  execute = (graph: Graph, name: string, params: object) => {
    const Command = this.command[name];

    if (!Command) {
      return;
    }

    const command = Object.create(Command);

    if (params) {
      command.params = {
        ...command.params,
        ...params,
      };
    }

    if (!command.canExecute(graph)) {
      return;
    }

    command.init(graph);

    graph.emit(EditorEvent.onBeforeExecuteCommand, {
      name: command.name,
      params: command.params,
    });

    command.execute(graph);

    graph.emit(EditorEvent.onAfterExecuteCommand, {
      name: command.name,
      params: command.params,
    });

    if (!command.canUndo(graph)) {
      return;
    }

    const { commandQueue, commandIndex } = this;

    commandQueue.splice(
      commandIndex,
      commandQueue.length - commandIndex,
      command,
    );

    this.commandIndex += 1;
  }
}

export default new CommandManager();