/**
 * DOM Resilience Patch
 * Eliminates the fatal:
 * "NotFoundError: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node."
 * and "NotFoundError: Failed to execute 'insertBefore' on 'Node'"
 *
 * This occurs when external agents (such as Google Translate, browser translation extensions,
 * Grammarly, password autofill, or dark mode injectors) wrap or modify DOM text nodes (<font> tags)
 * while React's reconciler attempts to unmount or re-order host elements.
 */

let isPatched = false;

export function installDomResilience(): void {
  if (isPatched) return;
  if (typeof window === "undefined" || typeof Node === "undefined" || !Node.prototype) return;

  try {
    const originalRemoveChild = Node.prototype.removeChild;
    Node.prototype.removeChild = function <T extends Node>(child: T): T {
      if (!child) return child;
      if (child.parentNode !== this) {
        // Child's actual parent is different (e.g. Google Translate <font> wrapper)
        if (child.parentNode) {
          try {
            return child.parentNode.removeChild(child) as T;
          } catch {
            // Silently swallow if parent node removal fails
          }
        }
        // Return child safely instead of throwing a fatal DOMException
        return child;
      }
      return originalRemoveChild.call(this, child) as T;
    };

    const originalInsertBefore = Node.prototype.insertBefore;
    Node.prototype.insertBefore = function <T extends Node>(newNode: T, referenceNode: Node | null): T {
      if (!newNode) return newNode;
      if (referenceNode && referenceNode.parentNode !== this) {
        if (referenceNode.parentNode) {
          try {
            return referenceNode.parentNode.insertBefore(newNode, referenceNode) as T;
          } catch {
            // Fallback
          }
        }
        // Fall back to appendChild on this parent if referenceNode is displaced
        try {
          return this.appendChild(newNode) as T;
        } catch {
          return newNode;
        }
      }
      return originalInsertBefore.call(this, newNode, referenceNode) as T;
    };

    isPatched = true;
  } catch (err) {
    console.warn("[DOM Resilience] Failed to apply monkey-patch:", err);
  }
}
