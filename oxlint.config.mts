import { defineConfig } from "oxlint";

const disabledRules = [
    "eslint/arrow-body-style",
    "eslint/complexity",
    "eslint/id-length",
    "eslint/init-declarations",
    "eslint/max-depth",
    "eslint/max-lines-per-function",
    "eslint/max-lines",
    "eslint/max-params",
    "eslint/max-statements",
    "eslint/no-console",
    "eslint/no-continue",
    "eslint/no-eq-null",
    "eslint/no-inline-comments",
    "eslint/no-lonely-if",
    "eslint/no-magic-numbers",
    "eslint/no-negated-condition",
    "eslint/no-param-reassign",
    "eslint/no-plusplus",
    "eslint/no-ternary",
    "eslint/no-undefined",
    "eslint/no-underscore-dangle",
    "eslint/no-use-before-define",
    "eslint/prefer-destructuring",
    "eslint/sort-imports",
    "eslint/sort-keys",
    "eslint/sort-vars",
    "func-style",
    "import/exports-last",
    "import/group-exports",
    "import/no-named-export",
    "import/no-relative-parent-imports",
    "import/prefer-default-export",
    "oxc/no-async-await",
    "oxc/no-optional-chaining",
    "oxc/no-rest-spread-properties",
    "promise/prefer-await-to-callbacks",
    "typescript/prefer-function-type",
    "typescript/prefer-readonly-parameter-types",
    "typescript/promise-function-async",
    "unicorn/filename-case",
    "unicorn/no-console-spaces",
    "unicorn/no-lonely-if",
    "unicorn/no-negated-condition",
    "unicorn/no-null",
    "unicorn/prefer-at",
    "unicorn/prefer-global-this",
    "unicorn/prefer-query-selector",
    "unicorn/prefer-ternary",
    "unicorn/require-post-message-target-origin",
    "unicorn/switch-case-braces",
];

// oxlint-disable-next-line import/no-default-export
export default defineConfig({
    ignorePatterns: ["dist", "docs"],
    options: {
        typeAware: true,
        typeCheck: true,
    },
    env: {
        node: true,
        browser: true,
    },
    plugins: [
        "eslint",
        "typescript",
        "unicorn",
        "oxc",
        "import",
        "node",
        "promise",
    ],
    categories: {
        correctness: "warn",
        suspicious: "warn",
        pedantic: "warn",
        perf: "warn",
        style: "warn",
        restriction: "warn",
        nursery: "warn",
    },
    rules: {
        ...Object.fromEntries(disabledRules.map((r) => [r, "off"])),
        "eslint/no-duplicate-imports": [
            "warn",
            {
                allowSeparateTypeImports: true,
            },
        ],
        "eslint/no-restricted-imports": [
            "warn",
            {
                paths: [
                    {
                        name: "node:assert",
                        message: "Use node:assert/strict instead",
                    },
                ],
            },
        ],
        "eslint/no-unused-vars": [
            "warn",
            {
                argsIgnorePattern: "^_",
                varsIgnorePattern: "^_",
            },
        ],
        "import/no-unassigned-import": [
            "warn",
            {
                allow: ["**/*.css"],
            },
        ],
        "typescript/strict-boolean-expressions": [
            "warn",
            {
                allowNullableBoolean: true,
            },
        ],
        eqeqeq: [
            "warn",
            "always",
            {
                null: "never",
            },
        ],
    },
});
