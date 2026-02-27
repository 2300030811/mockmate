
export const DAILY_PROBLEMS = [
  {
    id: "p1",
    title: "Array Intersection",
    category: "Algorithms",
    difficulty: "Easy",
    points: 10,
    description: `Given two integer arrays \`nums1\` and \`nums2\`, return an array of their intersection. Each element in the result must be unique and you may return the result in any order.`,
    examples: [
      { input: "nums1 = [1,2,2,1], nums2 = [2,2]", output: "[2]" },
      { input: "nums1 = [4,9,5], nums2 = [9,4,9,8,4]", output: "[4,9]" }
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} nums1
 * @param {number[]} nums2
 * @return {number[]}
 */
function intersection(nums1, nums2) {
  // Your solution here

}

// ── Test Cases ──
console.log(intersection([1,2,2,1], [2,2]));       // Expected: [2]
console.log(intersection([4,9,5], [9,4,9,8,4]));   // Expected: [4,9]`,
      typescript: `function intersection(nums1: number[], nums2: number[]): number[] {
  // Your solution here

}

// ── Test Cases ──
console.log(intersection([1,2,2,1], [2,2]));       // Expected: [2]
console.log(intersection([4,9,5], [9,4,9,8,4]));   // Expected: [4,9]`,
      python: `from typing import List

def intersection(nums1: List[int], nums2: List[int]) -> List[int]:
    # Your solution here
    pass

# ── Test Cases ──
print(intersection([1,2,2,1], [2,2]))       # Expected: [2]
print(intersection([4,9,5], [9,4,9,8,4]))   # Expected: [4,9]`,
      c: `#include <stdio.h>
#include <stdlib.h>

int* intersection(int* nums1, int n1, int* nums2, int n2, int* returnSize) {
    // Your solution here
    *returnSize = 0;
    return NULL;
}

int main() {
    int nums1[] = {1,2,2,1}, nums2[] = {2,2};
    int size;
    int* result = intersection(nums1, 4, nums2, 2, &size);
    // Expected: [2]
    printf("[");
    for (int i = 0; i < size; i++) printf("%d%s", result[i], i < size-1 ? "," : "");
    printf("]\\n");
    free(result);
    return 0;
}`,
      cpp: `#include <iostream>
#include <vector>
#include <unordered_set>
using namespace std;

vector<int> intersection(vector<int>& nums1, vector<int>& nums2) {
    // Your solution here

}

int main() {
    vector<int> n1 = {1,2,2,1}, n2 = {2,2};
    auto res = intersection(n1, n2);
    // Expected: [2]
    cout << "[";
    for (int i = 0; i < (int)res.size(); i++) cout << res[i] << (i < (int)res.size()-1 ? "," : "");
    cout << "]" << endl;
    return 0;
}`
    }
  },
  {
    id: "p2",
    title: "Longest Substring",
    category: "Strings",
    difficulty: "Medium",
    points: 20,
    description: "Given a string `s`, find the length of the longest substring without repeating characters.",
    examples: [
      { input: "s = \"abcabcbb\"", output: "3" },
      { input: "s = \"bbbbb\"", output: "1" }
    ],
    starterCode: {
      javascript: `/**
 * @param {string} s
 * @return {number}
 */
function lengthOfLongestSubstring(s) {
  // Your solution here

}

// ── Test Cases ──
console.log(lengthOfLongestSubstring("abcabcbb"));  // Expected: 3
console.log(lengthOfLongestSubstring("bbbbb"));      // Expected: 1
console.log(lengthOfLongestSubstring("pwwkew"));     // Expected: 3`,
      typescript: `function lengthOfLongestSubstring(s: string): number {
  // Your solution here

}

// ── Test Cases ──
console.log(lengthOfLongestSubstring("abcabcbb"));  // Expected: 3
console.log(lengthOfLongestSubstring("bbbbb"));      // Expected: 1
console.log(lengthOfLongestSubstring("pwwkew"));     // Expected: 3`,
      python: `def lengthOfLongestSubstring(s: str) -> int:
    # Your solution here
    pass

# ── Test Cases ──
print(lengthOfLongestSubstring("abcabcbb"))  # Expected: 3
print(lengthOfLongestSubstring("bbbbb"))      # Expected: 1
print(lengthOfLongestSubstring("pwwkew"))     # Expected: 3`,
      c: `#include <stdio.h>
#include <string.h>

int lengthOfLongestSubstring(char* s) {
    // Your solution here
    return 0;
}

int main() {
    printf("%d\\n", lengthOfLongestSubstring("abcabcbb"));  // Expected: 3
    printf("%d\\n", lengthOfLongestSubstring("bbbbb"));      // Expected: 1
    printf("%d\\n", lengthOfLongestSubstring("pwwkew"));     // Expected: 3
    return 0;
}`,
      cpp: `#include <iostream>
#include <string>
#include <unordered_set>
using namespace std;

int lengthOfLongestSubstring(string s) {
    // Your solution here

}

int main() {
    cout << lengthOfLongestSubstring("abcabcbb") << endl;  // Expected: 3
    cout << lengthOfLongestSubstring("bbbbb") << endl;      // Expected: 1
    cout << lengthOfLongestSubstring("pwwkew") << endl;     // Expected: 3
    return 0;
}`
    }
  },
  {
    id: "p3",
    title: "Merge K Lists",
    category: "Linked Lists",
    difficulty: "Hard",
    points: 50,
    description: "You are given an array of `k` linked-lists `lists`, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.",
    examples: [
      { input: "lists = [[1,4,5],[1,3,4],[2,6]]", output: "[1,1,2,3,4,4,5,6]" }
    ],
    starterCode: {
      javascript: `/**
 * Definition for singly-linked list.
 */
class ListNode {
  constructor(val = 0, next = null) {
    this.val = val;
    this.next = next;
  }
}

/**
 * @param {ListNode[]} lists
 * @return {ListNode}
 */
function mergeKLists(lists) {
  // Your solution here

}

// ── Helper & Test ──
function arrayToList(arr) {
  let dummy = new ListNode(0);
  let cur = dummy;
  for (const v of arr) { cur.next = new ListNode(v); cur = cur.next; }
  return dummy.next;
}
function listToArray(head) {
  const res = [];
  while (head) { res.push(head.val); head = head.next; }
  return res;
}

const lists = [[1,4,5],[1,3,4],[2,6]].map(arrayToList);
console.log(listToArray(mergeKLists(lists)));  // Expected: [1,1,2,3,4,4,5,6]`,
      typescript: `class ListNode {
  val: number;
  next: ListNode | null;
  constructor(val = 0, next: ListNode | null = null) {
    this.val = val;
    this.next = next;
  }
}

function mergeKLists(lists: (ListNode | null)[]): ListNode | null {
  // Your solution here

}

// ── Helper & Test ──
function arrayToList(arr: number[]): ListNode | null {
  let dummy = new ListNode(0);
  let cur = dummy;
  for (const v of arr) { cur.next = new ListNode(v); cur = cur.next; }
  return dummy.next;
}
function listToArray(head: ListNode | null): number[] {
  const res: number[] = [];
  while (head) { res.push(head.val); head = head.next; }
  return res;
}

const lists = [[1,4,5],[1,3,4],[2,6]].map(arrayToList);
console.log(listToArray(mergeKLists(lists)));  // Expected: [1,1,2,3,4,4,5,6]`,
      python: `from typing import List, Optional
import heapq

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def mergeKLists(lists: List[Optional[ListNode]]) -> Optional[ListNode]:
    # Your solution here
    pass

# ── Helper & Test ──
def to_list(arr):
    dummy = ListNode(0)
    cur = dummy
    for v in arr:
        cur.next = ListNode(v)
        cur = cur.next
    return dummy.next

def to_array(head):
    res = []
    while head:
        res.append(head.val)
        head = head.next
    return res

lists = [to_list(a) for a in [[1,4,5],[1,3,4],[2,6]]]
print(to_array(mergeKLists(lists)))  # Expected: [1,1,2,3,4,4,5,6]`,
      c: `#include <stdio.h>
#include <stdlib.h>

struct ListNode {
    int val;
    struct ListNode* next;
};

struct ListNode* mergeKLists(struct ListNode** lists, int k) {
    // Your solution here
    return NULL;
}

int main() {
    printf("Implement mergeKLists and test here\\n");
    return 0;
}`,
      cpp: `#include <iostream>
#include <vector>
#include <queue>
using namespace std;

struct ListNode {
    int val;
    ListNode* next;
    ListNode(int x) : val(x), next(nullptr) {}
};

ListNode* mergeKLists(vector<ListNode*>& lists) {
    // Your solution here

}

// ── Helper & Test ──
ListNode* toList(vector<int> arr) {
    ListNode dummy(0); ListNode* cur = &dummy;
    for (int v : arr) { cur->next = new ListNode(v); cur = cur->next; }
    return dummy.next;
}
void print(ListNode* h) {
    cout << "[";
    while (h) { cout << h->val << (h->next ? "," : ""); h = h->next; }
    cout << "]" << endl;
}

int main() {
    vector<ListNode*> lists = {toList({1,4,5}), toList({1,3,4}), toList({2,6})};
    print(mergeKLists(lists));  // Expected: [1,1,2,3,4,4,5,6]
    return 0;
}`
    }
  },
  {
    id: "p4",
    title: "Valid Palindrome",
    category: "Strings",
    difficulty: "Easy",
    points: 10,
    description: "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.",
    examples: [
      { input: "s = \"A man, a plan, a canal: Panama\"", output: "true" },
      { input: "s = \"race a car\"", output: "false" }
    ],
    starterCode: {
      javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
function isPalindrome(s) {
  // Your solution here

}

// ── Test Cases ──
console.log(isPalindrome("A man, a plan, a canal: Panama"));  // Expected: true
console.log(isPalindrome("race a car"));                       // Expected: false
console.log(isPalindrome(" "));                                // Expected: true`,
      typescript: `function isPalindrome(s: string): boolean {
  // Your solution here

}

// ── Test Cases ──
console.log(isPalindrome("A man, a plan, a canal: Panama"));  // Expected: true
console.log(isPalindrome("race a car"));                       // Expected: false
console.log(isPalindrome(" "));                                // Expected: true`,
      python: `def isPalindrome(s: str) -> bool:
    # Your solution here
    pass

# ── Test Cases ──
print(isPalindrome("A man, a plan, a canal: Panama"))  # Expected: True
print(isPalindrome("race a car"))                       # Expected: False
print(isPalindrome(" "))                                # Expected: True`,
      c: `#include <stdio.h>
#include <string.h>
#include <ctype.h>
#include <stdbool.h>

bool isPalindrome(char* s) {
    // Your solution here
    return false;
}

int main() {
    printf("%s\\n", isPalindrome("A man, a plan, a canal: Panama") ? "true" : "false");  // Expected: true
    printf("%s\\n", isPalindrome("race a car") ? "true" : "false");                       // Expected: false
    return 0;
}`,
      cpp: `#include <iostream>
#include <string>
#include <cctype>
using namespace std;

bool isPalindrome(string s) {
    // Your solution here

}

int main() {
    cout << boolalpha;
    cout << isPalindrome("A man, a plan, a canal: Panama") << endl;  // Expected: true
    cout << isPalindrome("race a car") << endl;                       // Expected: false
    return 0;
}`
    }
  },
  {
    id: "p5",
    title: "Search in Rotated Array",
    category: "Algorithms",
    difficulty: "Medium",
    points: 25,
    description: "Search for a target value in a sorted array that has been rotated at an unknown pivot. Return the index of the target, or -1 if not found.",
    examples: [
      { input: "nums = [4,5,6,7,0,1,2], target = 0", output: "4" },
      { input: "nums = [4,5,6,7,0,1,2], target = 3", output: "-1" }
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
function search(nums, target) {
  // Your solution here

}

// ── Test Cases ──
console.log(search([4,5,6,7,0,1,2], 0));  // Expected: 4
console.log(search([4,5,6,7,0,1,2], 3));  // Expected: -1
console.log(search([1], 0));               // Expected: -1`,
      typescript: `function search(nums: number[], target: number): number {
  // Your solution here

}

// ── Test Cases ──
console.log(search([4,5,6,7,0,1,2], 0));  // Expected: 4
console.log(search([4,5,6,7,0,1,2], 3));  // Expected: -1
console.log(search([1], 0));               // Expected: -1`,
      python: `from typing import List

def search(nums: List[int], target: int) -> int:
    # Your solution here
    pass

# ── Test Cases ──
print(search([4,5,6,7,0,1,2], 0))  # Expected: 4
print(search([4,5,6,7,0,1,2], 3))  # Expected: -1
print(search([1], 0))               # Expected: -1`,
      c: `#include <stdio.h>

int search(int* nums, int n, int target) {
    // Your solution here
    return -1;
}

int main() {
    int nums[] = {4,5,6,7,0,1,2};
    printf("%d\\n", search(nums, 7, 0));  // Expected: 4
    printf("%d\\n", search(nums, 7, 3));  // Expected: -1
    return 0;
}`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

int search(vector<int>& nums, int target) {
    // Your solution here

}

int main() {
    vector<int> nums = {4,5,6,7,0,1,2};
    cout << search(nums, 0) << endl;  // Expected: 4
    cout << search(nums, 3) << endl;  // Expected: -1
    return 0;
}`
    }
  }
];
