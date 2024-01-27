// Name of the ID attribute we will use to identify important information
const TV = "tommy_value"

// A list of currently important tags we want to be aware of
const TAGS =  ["P", "A", "H1", "H2", "H3", "TITLE"];

// A list of all found important nodes transformed into Tommy_Nodes
const SEARCH_NODES = [];

// Class for our data structure holding the important data from nodes
class Tommy_Node {
    tag: HTMLElement;
    data: string;
    assoc: Tommy_Node[];
    key: string;
    parent?: Tommy_Node;
    constructor(tag: HTMLElement, data: string, key: string, parent?: Tommy_Node) {
        this.tag = tag;
        this.data = data;
        this.assoc = [];
        this.key = key;
        this.parent = parent;
    }
   
}

export function FilteredDOM() {

    // Get the body node of the DOM
    const node = document.getElementsByTagName("body");

    const root = new Tommy_Node(node[0], node[0].textContent as string, "random", undefined);

    function traverseDOM(node: Node, parent: Tommy_Node): void{
        // Node is the current DOM node of the file
    
        // First check to determine whether the node is a proper element node
        if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement;
        
            // Then check to see if the nodeName is one of the important tags to mark down
            if (TAGS.includes(element.nodeName)) {
                const new_node = new Tommy_Node(element, element.textContent as string, "random_string", parent);
                parent = new_node;
                element.setAttribute(TV, "random_string");
                SEARCH_NODES.push(new_node);
            }
        }

        // Visit each child of the current node
        node.childNodes.forEach(childNode => {
            traverseDOM(childNode, parent);
        });
    }

    traverseDOM(node[0], root);
}

