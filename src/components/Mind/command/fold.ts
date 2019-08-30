import { TreeGraph, MindNodeModel } from '@common/interface';
import commandManager from '@common/commandManager';
import { baseCommand, BaseCommand } from '@components/Graph/command/base';

interface FoldCommandParams {
  id: string;
}

export const foldCommand: BaseCommand<FoldCommandParams> = {
  ...baseCommand,

  params: {
    id: '',
  },

  canExecute(graph: TreeGraph) {
    const selectedNodes = this.getSelectedNodes(graph);

    if (!selectedNodes.length) {
      return false;
    }

    const selectedNode = selectedNodes[0];
    const selectedNodeModel = selectedNode.getModel<MindNodeModel>();

    if (!selectedNodeModel.children || !selectedNodeModel.children.length) {
      return false;
    }

    if (selectedNodeModel.collapsed) {
      return false;
    }

    return true;
  },

  init(graph) {
    const selectedNode = this.getSelectedNodes(graph)[0];
    const selectedNodeModel = selectedNode.getModel<MindNodeModel>();

    this.params = {
      id: selectedNodeModel.id,
    };
  },

  execute(graph: TreeGraph) {
    const { id } = this.params;

    const sourceData = graph.findDataById(id);

    sourceData.collapsed = !sourceData.collapsed;

    graph.refreshLayout();
  },

  undo(graph) {
    this.execute(graph);
  },

  shortcuts: [['metaKey', '/'], ['ctrlKey', '/']],
};

commandManager.register('fold', foldCommand);