'use strict';
angular.module('demo', [
    'znk.infra-web-app.tutorials',
    'demoEnv'
])
    .constant("categoriesConstant", [{
        "id": 0,
        "name": "Mathematics",
        "shortName": "M",
        "parentId": null,
        "typeId": 101,
        "instruction": null,
        "weight": null
    }, {
        "id": 1,
        "name": "Reading",
        "shortName": "R",
        "parentId": null,
        "typeId": 101,
        "instruction": null,
        "weight": null
    }, {
        "id": 2,
        "name": "Writing",
        "shortName": "W",
        "parentId": null,
        "typeId": 101,
        "instruction": null,
        "weight": null
    }, {
        "id": 5,
        "name": "English",
        "shortName": "E",
        "parentId": null,
        "typeId": 101,
        "instruction": null,
        "weight": null
    }, {
        "id": 6,
        "name": "Science",
        "shortName": "S",
        "parentId": null,
        "typeId": 101,
        "instruction": null,
        "weight": null
    }, {
        "id": 133,
        "name": "Punctuation",
        "shortName": "PU",
        "parentId": 261,
        "typeId": 103,
        "instruction": null,
        "weight": null
    }, {
        "id": 134,
        "name": "Grammar and Usage",
        "shortName": "GU",
        "parentId": 261,
        "typeId": 103,
        "instruction": null,
        "weight": null
    }, {
        "id": 135,
        "name": "Sentence Structure",
        "shortName": "SS",
        "parentId": 261,
        "typeId": 103,
        "instruction": null,
        "weight": null
    }, {
        "id": 136,
        "name": "Rhetorical Strategy",
        "shortName": "RS",
        "parentId": 262,
        "typeId": 103,
        "instruction": null,
        "weight": null
    }, {
        "id": 137,
        "name": "Ordering",
        "shortName": "OR",
        "parentId": 262,
        "typeId": 103,
        "instruction": null,
        "weight": null
    }, {
        "id": 138,
        "name": "Style",
        "shortName": "ST",
        "parentId": 262,
        "typeId": 103,
        "instruction": null,
        "weight": null
    }, {
        "id": 140,
        "name": "Comprehension",
        "shortName": "SC",
        "parentId": 267,
        "typeId": 103,
        "instruction": "Social and Natural Science",
        "weight": null
    }, {
        "id": 141,
        "name": "Purpose",
        "shortName": "SG",
        "parentId": 267,
        "typeId": 103,
        "instruction": "Science/Natural Science",
        "weight": null
    }, {
        "id": 142,
        "name": "Vocabulary",
        "shortName": "SV",
        "parentId": 267,
        "typeId": 103,
        "instruction": "Science/Natural Science",
        "weight": null
    }, {
        "id": 143,
        "name": "Inference",
        "shortName": "SL",
        "parentId": 267,
        "typeId": 103,
        "instruction": "Science/Natural Science",
        "weight": null
    }, {
        "id": 144,
        "name": "Tone",
        "shortName": "ST",
        "parentId": 267,
        "typeId": 103,
        "instruction": "Science/Natural Science",
        "weight": null
    }, {
        "id": 149,
        "name": "Scientific Data",
        "shortName": "DD",
        "parentId": 268,
        "typeId": 103,
        "instruction": null,
        "weight": null
    }, {
        "id": 150,
        "name": "Scientific Logic",
        "shortName": "LD",
        "parentId": 268,
        "typeId": 103,
        "instruction": null,
        "weight": null
    }, {
        "id": 151,
        "name": "Numbers and Operations",
        "shortName": "NO",
        "parentId": 264,
        "typeId": 103,
        "instruction": null,
        "weight": null
    }, {
        "id": 152,
        "name": "Coordinate Geometry",
        "shortName": "CG",
        "parentId": 263,
        "typeId": 103,
        "instruction": null,
        "weight": null
    }, {
        "id": 153,
        "name": "Polygons + Plane Geometry",
        "shortName": "PG",
        "parentId": 265,
        "typeId": 103,
        "instruction": null,
        "weight": null
    }, {
        "id": 154,
        "name": "Writing Scoring",
        "shortName": "WS",
        "parentId": 271,
        "typeId": 103,
        "instruction": null,
        "weight": null
    }, {
        "id": 155,
        "name": "Comma",
        "shortName": "COMM",
        "parentId": 133,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 156,
        "name": "Apostrophe",
        "shortName": "APOS",
        "parentId": 133,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 157,
        "name": "Colons, Semicolons",
        "shortName": "COSE",
        "parentId": 133,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 158,
        "name": "Periods, Question Mark, Exclamation Point",
        "shortName": "PQEP",
        "parentId": 133,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 159,
        "name": "Dashes and Parenthesis",
        "shortName": "DAPA",
        "parentId": 133,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 160,
        "name": "Agreement",
        "shortName": "AGRE",
        "parentId": 134,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 161,
        "name": "Verb Tense",
        "shortName": "VERB",
        "parentId": 134,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 162,
        "name": "Pronouns",
        "shortName": "PRON",
        "parentId": 134,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 163,
        "name": "Comparatives and Superlatives",
        "shortName": "SUPE",
        "parentId": 134,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 164,
        "name": "Idioms",
        "shortName": "IDIO",
        "parentId": 134,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 165,
        "name": "Subordinate and Dependent Clauses",
        "shortName": "SUBO",
        "parentId": 135,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 166,
        "name": "Run-On Sentence",
        "shortName": "RUNS",
        "parentId": 135,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 167,
        "name": "Comma Splice",
        "shortName": "COSP",
        "parentId": 135,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 168,
        "name": "Sentence Fragment",
        "shortName": "SFRA",
        "parentId": 135,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 169,
        "name": "Misplaced Modifier",
        "shortName": "MODI",
        "parentId": 135,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 170,
        "name": "Pronoun Shift",
        "shortName": "SHIF",
        "parentId": 135,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 171,
        "name": "Relevance",
        "shortName": "RELE",
        "parentId": 136,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 172,
        "name": "Writer's Goal",
        "shortName": "GOAL",
        "parentId": 136,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 173,
        "name": "Sentence Ordering",
        "shortName": "SORD",
        "parentId": 137,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 174,
        "name": "Paragraph Ordering",
        "shortName": "PORD",
        "parentId": 137,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 175,
        "name": "Transistional Phrase",
        "shortName": "TRAN",
        "parentId": 137,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 176,
        "name": "Conjunction",
        "shortName": "CONJ",
        "parentId": 137,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 177,
        "name": "Opening or Closing Statements",
        "shortName": "OPCL",
        "parentId": 137,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 178,
        "name": "Redundant Phrase",
        "shortName": "REDU",
        "parentId": 138,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 179,
        "name": "Tone",
        "shortName": "TONE",
        "parentId": 138,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 180,
        "name": "Wordiness",
        "shortName": "WORI",
        "parentId": 138,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 182,
        "name": "Factual Information",
        "shortName": "FASN",
        "parentId": 140,
        "typeId": 104,
        "instruction": "Science/Natural Science",
        "weight": null
    }, {
        "id": 183,
        "name": "Rephrasing",
        "shortName": "RESN",
        "parentId": 140,
        "typeId": 104,
        "instruction": "Science/Natural Science",
        "weight": null
    }, {
        "id": 184,
        "name": "List",
        "shortName": "LISN",
        "parentId": 140,
        "typeId": 104,
        "instruction": "Science/Natural Science",
        "weight": null
    }, {
        "id": 185,
        "name": "Except/Not",
        "shortName": "EXSN",
        "parentId": 140,
        "typeId": 104,
        "instruction": "Science/Natural Science",
        "weight": null
    }, {
        "id": 186,
        "name": "Chronology",
        "shortName": "CHSN",
        "parentId": 140,
        "typeId": 104,
        "instruction": "Science/Natural Science",
        "weight": null
    }, {
        "id": 187,
        "name": "Paraphrasing",
        "shortName": "PASN",
        "parentId": 140,
        "typeId": 104,
        "instruction": "Science/Natural Science",
        "weight": null
    }, {
        "id": 188,
        "name": "Main Idea",
        "shortName": "MASN",
        "parentId": 141,
        "typeId": 104,
        "instruction": "Science/Natural Science",
        "weight": null
    }, {
        "id": 189,
        "name": "Primary Purpose",
        "shortName": "PRSN",
        "parentId": 141,
        "typeId": 104,
        "instruction": "Science/Natural Science",
        "weight": null
    }, {
        "id": 190,
        "name": "Supporting Evidence",
        "shortName": "SUSN",
        "parentId": 141,
        "typeId": 104,
        "instruction": "Science/Natural Science",
        "weight": null
    }, {
        "id": 191,
        "name": "Vocabulary in Context",
        "shortName": "VCSN",
        "parentId": 142,
        "typeId": 104,
        "instruction": "Science/Natural Science",
        "weight": null
    }, {
        "id": 192,
        "name": "Logical Inference without Dates",
        "shortName": "LOSN",
        "parentId": 143,
        "typeId": 104,
        "instruction": "Science/Natural Science",
        "weight": null
    }, {
        "id": 193,
        "name": "Logical Inference with Dates",
        "shortName": "DASN",
        "parentId": 143,
        "typeId": 104,
        "instruction": "Science/Natural Science",
        "weight": null
    }, {
        "id": 194,
        "name": "Tone",
        "shortName": "TOSN",
        "parentId": 144,
        "typeId": 104,
        "instruction": "Science/Natural Science",
        "weight": null
    }, {
        "id": 195,
        "name": "Qualitative Reading for Data Interpretation",
        "shortName": "QTDA",
        "parentId": 149,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 196,
        "name": "Quantitative Reading for Data Interpretation",
        "shortName": "QLDA",
        "parentId": 149,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 197,
        "name": "Relationships between Variables for Data Interpretation",
        "shortName": "RVDA",
        "parentId": 149,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 198,
        "name": "Extrapolation and Interpolation for Data Interpretation",
        "shortName": "EXDA",
        "parentId": 149,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 199,
        "name": "Applying New Evidence for Data Interpretation",
        "shortName": "AEDA",
        "parentId": 150,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 200,
        "name": "Hypothesis Formulation for Data Interpretation",
        "shortName": "HFDA",
        "parentId": 150,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 201,
        "name": "Experimental Design for Data Interpretation",
        "shortName": "EDDA",
        "parentId": 150,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 202,
        "name": "Using Written Definitions for Data Interpretation",
        "shortName": "WDDA",
        "parentId": 150,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 203,
        "name": "Drawing Logical Conclusions for Data Interpretation",
        "shortName": "LCDA",
        "parentId": 150,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 204,
        "name": "Hypothesis Evaluation for Data Interpretation",
        "shortName": "HEDA",
        "parentId": 150,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 205,
        "name": "Absolute Value",
        "shortName": "ABSV",
        "parentId": 272,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 206,
        "name": "Angles In The Plane",
        "shortName": "ANGL",
        "parentId": 153,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 207,
        "name": "Arc Segments And Sector Areas",
        "shortName": "ASSA",
        "parentId": 153,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 208,
        "name": "Circles",
        "shortName": "CIRC",
        "parentId": 153,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 209,
        "name": "Combined Shapes",
        "shortName": "COMB",
        "parentId": 153,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 210,
        "name": "Complex Numbers",
        "shortName": "CPLX",
        "parentId": 272,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 211,
        "name": "Coordinate Geometry",
        "shortName": "COOR",
        "parentId": 152,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 212,
        "name": "Counting Problems",
        "shortName": "CNTG",
        "parentId": 151,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 213,
        "name": "Data Interpretation",
        "shortName": "DATA",
        "parentId": 151,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 214,
        "name": "Dimension Shifts",
        "shortName": "DIMS",
        "parentId": 153,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 215,
        "name": "Direct And Inverse Variation",
        "shortName": "DAIV",
        "parentId": 272,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 216,
        "name": "Distance Formula",
        "shortName": "DISF",
        "parentId": 152,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 217,
        "name": "Elementary Number Theory",
        "shortName": "ENTH",
        "parentId": 151,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 218,
        "name": "Engish To Math",
        "shortName": "ETOM",
        "parentId": 273,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 219,
        "name": "Equilateral + Isosceles",
        "shortName": "EQIT",
        "parentId": 153,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 220,
        "name": "Exponents",
        "shortName": "EXPR",
        "parentId": 151,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 221,
        "name": "Fractions And Rational Numbers",
        "shortName": "FRAC",
        "parentId": 151,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 222,
        "name": "Evaluating Functions",
        "shortName": "FEVA",
        "parentId": 152,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 223,
        "name": "Domain and Range of Functions",
        "shortName": "FDAR",
        "parentId": 152,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 224,
        "name": "Linear Functions",
        "shortName": "FLIN",
        "parentId": 152,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 225,
        "name": "Quadratic Functions",
        "shortName": "FQDR",
        "parentId": 152,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 226,
        "name": "Qualitative Behavior of Functions",
        "shortName": "FQLT",
        "parentId": 152,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 227,
        "name": "Functions As Models",
        "shortName": "FMOD",
        "parentId": 272,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 228,
        "name": "00",
        "shortName": "00",
        "parentId": null,
        "typeId": 5,
        "instruction": null,
        "weight": null
    }, {
        "id": 229,
        "name": "Inequalities",
        "shortName": "INEQ",
        "parentId": 272,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 230,
        "name": "Integer Properties",
        "shortName": "INTP",
        "parentId": 151,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 231,
        "name": "Logarithms",
        "shortName": "LOGS",
        "parentId": 272,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 232,
        "name": "Logical Reasoning and Sets",
        "shortName": "SETS",
        "parentId": 273,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 233,
        "name": "Matrices",
        "shortName": "MTRX",
        "parentId": 272,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 234,
        "name": "Mean/Median/Mode",
        "shortName": "AVGS",
        "parentId": 151,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 235,
        "name": "Midpoint Formula",
        "shortName": "MIDF",
        "parentId": 152,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 236,
        "name": "Number Line",
        "shortName": "NUML",
        "parentId": 152,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 237,
        "name": "Operations On Algebraic Expressions",
        "shortName": "OPER",
        "parentId": 273,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 238,
        "name": "Percent",
        "shortName": "PERC",
        "parentId": 151,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 239,
        "name": "Points And Lines",
        "shortName": "PNTS",
        "parentId": 152,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 240,
        "name": "Polygons with more than 4 sides",
        "shortName": "POLY",
        "parentId": 153,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 241,
        "name": "Probability",
        "shortName": "PROB",
        "parentId": 151,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 242,
        "name": "Quadrilaterals (Parallelograms, Squares, Rectangles)",
        "shortName": "QDLT",
        "parentId": 153,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 243,
        "name": "Ratios And Proportions",
        "shortName": "RATE",
        "parentId": 151,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 244,
        "name": "Right Triangles And The Pythagorean Theorem",
        "shortName": "RGTT",
        "parentId": 153,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 245,
        "name": "Rounding",
        "shortName": "RNDG",
        "parentId": 151,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 246,
        "name": "Scientific Notation",
        "shortName": "SCIN",
        "parentId": 151,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 247,
        "name": "Sequences",
        "shortName": "SEQS",
        "parentId": 272,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 248,
        "name": "Similar Triangles",
        "shortName": "SIMT",
        "parentId": 153,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 249,
        "name": "Slopes, Parallel Lines, And Perpendicular Lines",
        "shortName": "SLPS",
        "parentId": 152,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 250,
        "name": "Solid Geometry",
        "shortName": "SLID",
        "parentId": 153,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 251,
        "name": "Solving Equations",
        "shortName": "SOLV",
        "parentId": 273,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 252,
        "name": "Solving Quadratic Equations By Factoring",
        "shortName": "QUAD",
        "parentId": 272,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 253,
        "name": "Systems Of Linear Equations And Inequalities",
        "shortName": "SYSE",
        "parentId": 151,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 254,
        "name": "Translations And Transformations",
        "shortName": "TRNF",
        "parentId": 152,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 255,
        "name": "Triangles",
        "shortName": "TRIS",
        "parentId": 153,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 256,
        "name": "Evaluating Expressions/Formulas",
        "shortName": "TRID",
        "parentId": 274,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 257,
        "name": "Right Triangle",
        "shortName": "TRRT",
        "parentId": 274,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 258,
        "name": "Unit Circle/Radians/Graphs",
        "shortName": "TRUC",
        "parentId": 274,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 259,
        "name": "Weighted Mean",
        "shortName": "WAVG",
        "parentId": 151,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 260,
        "name": "Word Problems",
        "shortName": "WORD",
        "parentId": 273,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 261,
        "name": "Usage and Mechanics",
        "shortName": "UM",
        "parentId": 5,
        "typeId": 102,
        "instruction": null,
        "weight": null
    }, {
        "id": 262,
        "name": "Rhetorical Skills",
        "shortName": "RH",
        "parentId": 5,
        "typeId": 102,
        "instruction": null,
        "weight": null
    }, {
        "id": 263,
        "name": "Intermediate Algebra and Coordinate Geometry",
        "shortName": "AC",
        "parentId": 0,
        "typeId": 102,
        "instruction": null,
        "weight": null
    }, {
        "id": 264,
        "name": "Elementary Algebra",
        "shortName": "PA",
        "parentId": 0,
        "typeId": 102,
        "instruction": null,
        "weight": null
    }, {
        "id": 265,
        "name": "Plane Geometry and Trigonometry",
        "shortName": "PT",
        "parentId": 0,
        "typeId": 102,
        "instruction": null,
        "weight": null
    }, {
        "id": 266,
        "name": "Arts and Literature",
        "shortName": "AL",
        "parentId": 1,
        "typeId": 102,
        "instruction": null,
        "weight": null
    }, {
        "id": 267,
        "name": "Social and Natural Science",
        "shortName": "SN",
        "parentId": 1,
        "typeId": 102,
        "instruction": null,
        "weight": null
    }, {
        "id": 268,
        "name": "Data Analysis",
        "shortName": "DA",
        "parentId": 6,
        "typeId": 102,
        "instruction": null,
        "weight": null
    }, {
        "id": 269,
        "name": "Research Summary",
        "shortName": "RS",
        "parentId": 6,
        "typeId": 102,
        "instruction": null,
        "weight": null
    }, {
        "id": 270,
        "name": "Conflicting Viewpoints",
        "shortName": "CV",
        "parentId": 6,
        "typeId": 102,
        "instruction": null,
        "weight": null
    }, {
        "id": 271,
        "name": "Essay",
        "shortName": "ES",
        "parentId": 2,
        "typeId": 102,
        "instruction": null,
        "weight": null
    }, {
        "id": 272,
        "name": "Intermediate Algebra",
        "shortName": "IA",
        "parentId": 263,
        "typeId": 103,
        "instruction": null,
        "weight": null
    }, {
        "id": 273,
        "name": "Solving Equations / Word Problems",
        "shortName": "SW",
        "parentId": 264,
        "typeId": 103,
        "instruction": null,
        "weight": null
    }, {
        "id": 274,
        "name": "Introductory Trigonometry",
        "shortName": "TR",
        "parentId": 265,
        "typeId": 103,
        "instruction": null,
        "weight": null
    }, {
        "id": 275,
        "name": "Arts Comprehension",
        "shortName": "AC",
        "parentId": 266,
        "typeId": 103,
        "instruction": null,
        "weight": null
    }, {
        "id": 276,
        "name": "Arts Purpose",
        "shortName": "AP",
        "parentId": 266,
        "typeId": 103,
        "instruction": null,
        "weight": null
    }, {
        "id": 277,
        "name": "Arts Vocabulary",
        "shortName": "AV",
        "parentId": 266,
        "typeId": 103,
        "instruction": null,
        "weight": null
    }, {
        "id": 278,
        "name": "Arts Inference",
        "shortName": "AI",
        "parentId": 266,
        "typeId": 103,
        "instruction": null,
        "weight": null
    }, {
        "id": 279,
        "name": "Arts Tone",
        "shortName": "AT",
        "parentId": 266,
        "typeId": 103,
        "instruction": null,
        "weight": null
    }, {
        "id": 280,
        "name": "Scientific Data in Research Summaries",
        "shortName": "DS",
        "parentId": 269,
        "typeId": 103,
        "instruction": null,
        "weight": null
    }, {
        "id": 281,
        "name": "Scientific Logic in Research Summaries",
        "shortName": "LS",
        "parentId": 269,
        "typeId": 103,
        "instruction": null,
        "weight": null
    }, {
        "id": 282,
        "name": "Scientific Data for Conflicting Scientific Viewpoints",
        "shortName": "DV",
        "parentId": 270,
        "typeId": 103,
        "instruction": null,
        "weight": null
    }, {
        "id": 283,
        "name": "Scientific Logic in Conflicting Scientific Viewpoints",
        "shortName": "LV",
        "parentId": 270,
        "typeId": 103,
        "instruction": null,
        "weight": null
    }, {
        "id": 284,
        "name": "Qualitative Reading in Research Summaries",
        "shortName": "QTRS",
        "parentId": 280,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 285,
        "name": "Quantitative Reading in Research Summaries",
        "shortName": "QLRS",
        "parentId": 280,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 286,
        "name": "Relationships between Variables in Research Summaries",
        "shortName": "RVRS",
        "parentId": 280,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 287,
        "name": "Extrapolation and Interpolation in Research Summaries",
        "shortName": "EXRS",
        "parentId": 280,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 288,
        "name": "Applying New Evidence in Research Summaries",
        "shortName": "AERS",
        "parentId": 281,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 289,
        "name": "Hypothesis Formulation in Research Summaries",
        "shortName": "HFRS",
        "parentId": 281,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 290,
        "name": "Experimental Design in Research Summaries",
        "shortName": "EDRS",
        "parentId": 281,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 291,
        "name": "Using Written Definitions in Research Summaries",
        "shortName": "WDRS",
        "parentId": 281,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 292,
        "name": "Drawing Logical Conclusions in Research Summaries",
        "shortName": "LCRS",
        "parentId": 281,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 293,
        "name": "Hypothesis Evaluation in Research Summaries",
        "shortName": "HERS",
        "parentId": 281,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 294,
        "name": "Qualitative Reading for Conflicting Scientific Viewpoints",
        "shortName": "QTCV",
        "parentId": 282,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 295,
        "name": "Quantitative Reading for Conflicting Scientific Viewpoints",
        "shortName": "QLCV",
        "parentId": 282,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 296,
        "name": "Relationships between Variables for Conflicting Scientific Viewpoints",
        "shortName": "RVCV",
        "parentId": 282,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 297,
        "name": "Extrapolation and Interpolation for Conflicting Scientific Viewpoints",
        "shortName": "EXCV",
        "parentId": 282,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 298,
        "name": "Applying New Evidence for Conflicting Scientific Viewpoints",
        "shortName": "AECV",
        "parentId": 283,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 299,
        "name": "Hypothesis Formulation for Conflicting Scientific Viewpoints",
        "shortName": "HFCV",
        "parentId": 283,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 300,
        "name": "Experimental Design for Conflicting Scientific Viewpoints",
        "shortName": "EDCV",
        "parentId": 283,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 301,
        "name": "Using Written Definitions for Conflicting Scientific Viewpoints",
        "shortName": "WDCV",
        "parentId": 283,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 302,
        "name": "Drawing Logical Conclusions for Conflicting Scientific Viewpoints",
        "shortName": "LCCV",
        "parentId": 283,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 303,
        "name": "Hypothesis Evaluation for Conflicting Scientific Viewpoints",
        "shortName": "HECV",
        "parentId": 283,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 304,
        "name": "Writing Analysis",
        "shortName": "WA",
        "parentId": 271,
        "typeId": 103,
        "instruction": null,
        "weight": null
    }, {
        "id": 305,
        "name": "Overall Score",
        "shortName": "WSCR",
        "parentId": 154,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 306,
        "name": "Organization",
        "shortName": "WORG",
        "parentId": 154,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 307,
        "name": "Reasoning and Support",
        "shortName": "WRAS",
        "parentId": 154,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 308,
        "name": "Taking a Position",
        "shortName": "WPOS",
        "parentId": 154,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 309,
        "name": "Use of Language",
        "shortName": "WUOL",
        "parentId": 154,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 311,
        "name": "Maintaining Focus",
        "shortName": "WFOC",
        "parentId": 154,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 312,
        "name": "Essay Thesis Statements",
        "shortName": "WTHS",
        "parentId": 304,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 313,
        "name": "Essay Introductions",
        "shortName": "WINT",
        "parentId": 304,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 314,
        "name": "Essay Body",
        "shortName": "WBDY",
        "parentId": 304,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 315,
        "name": "Essay Conclusions",
        "shortName": "WCON",
        "parentId": 304,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 316,
        "name": "Factual Information",
        "shortName": "FAAL",
        "parentId": 275,
        "typeId": 104,
        "instruction": "Arts and Literature",
        "weight": null
    }, {
        "id": 317,
        "name": "Rephrasing",
        "shortName": "REAL",
        "parentId": 275,
        "typeId": 104,
        "instruction": "Arts and Literature",
        "weight": null
    }, {
        "id": 318,
        "name": "List",
        "shortName": "LIAL",
        "parentId": 275,
        "typeId": 104,
        "instruction": "Arts and Literature",
        "weight": null
    }, {
        "id": 319,
        "name": "Except/Not",
        "shortName": "EXAL",
        "parentId": 275,
        "typeId": 104,
        "instruction": "Arts and Literature",
        "weight": null
    }, {
        "id": 320,
        "name": "Chronology",
        "shortName": "CHAL",
        "parentId": 275,
        "typeId": 104,
        "instruction": "Arts and Literature",
        "weight": null
    }, {
        "id": 321,
        "name": "Paraphrasing",
        "shortName": "PAAL",
        "parentId": 275,
        "typeId": 104,
        "instruction": "Arts and Literature",
        "weight": null
    }, {
        "id": 322,
        "name": "Main Idea",
        "shortName": "MAAL",
        "parentId": 276,
        "typeId": 104,
        "instruction": "Arts and Literature",
        "weight": null
    }, {
        "id": 323,
        "name": "Primary Purpose",
        "shortName": "PRAL",
        "parentId": 276,
        "typeId": 104,
        "instruction": "Arts and Literature",
        "weight": null
    }, {
        "id": 324,
        "name": "Supporting Evidence",
        "shortName": "SUAL",
        "parentId": 276,
        "typeId": 104,
        "instruction": "Arts and Literature",
        "weight": null
    }, {
        "id": 325,
        "name": "Vocabulary in Context",
        "shortName": "VCAL",
        "parentId": 277,
        "typeId": 104,
        "instruction": "Arts and Literature",
        "weight": null
    }, {
        "id": 326,
        "name": "Logical Inference without a Date",
        "shortName": "LOAL",
        "parentId": 278,
        "typeId": 104,
        "instruction": "Arts and Literature",
        "weight": null
    }, {
        "id": 327,
        "name": "Logical Inference with a Date",
        "shortName": "DAAL",
        "parentId": 278,
        "typeId": 104,
        "instruction": "Arts and Literature",
        "weight": null
    }, {
        "id": 328,
        "name": "Tone",
        "shortName": "TOAL",
        "parentId": 279,
        "typeId": 104,
        "instruction": "Arts and Literature",
        "weight": null
    }, {
        "id": 329,
        "name": "Writing Ideas and Analysis",
        "shortName": "WI",
        "parentId": 271,
        "typeId": 103,
        "instruction": null,
        "weight": null
    }, {
        "id": 330,
        "name": "Writing Development and Support",
        "shortName": "WD",
        "parentId": 271,
        "typeId": 103,
        "instruction": null,
        "weight": null
    }, {
        "id": 331,
        "name": "Writing Organization",
        "shortName": "WO",
        "parentId": 271,
        "typeId": 103,
        "instruction": null,
        "weight": null
    }, {
        "id": 332,
        "name": "Writing Language Usage and Convention",
        "shortName": "WL",
        "parentId": 271,
        "typeId": 103,
        "instruction": null,
        "weight": null
    }, {
        "id": 333,
        "name": "Essay Implications",
        "shortName": "WIMP",
        "parentId": 329,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 334,
        "name": "Essay Development",
        "shortName": "WDEL",
        "parentId": 330,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 335,
        "name": "Essay Sentence Placement",
        "shortName": "WPLA",
        "parentId": 331,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }, {
        "id": 336,
        "name": "Essay Revisions",
        "shortName": "WREV",
        "parentId": 332,
        "typeId": 104,
        "instruction": null,
        "weight": null
    }])

    .config(function ($translateProvider, SvgIconSrvProvider) {
        $translateProvider.useLoader('$translatePartialLoader', {
            urlTemplate: '/{part}/locale/{lang}.json'
        })
            .preferredLanguage('en');

        var svgMap = {
            'math-icon': 'svg/math-icon.svg',
            'verbal-icon': 'svg/verbal-icon.svg',
            'essay-icon': 'svg/essay-icon.svg'
        };
        SvgIconSrvProvider.registerSvgSources(svgMap);

    })

    .config(function ($urlRouterProvider) {
        $urlRouterProvider.otherwise('/tipsAndTricks');
    })

    .config(function ($stateProvider) {
        $stateProvider.state('app', {
            template: '<ui-view></ui-view>',
            abstract: true
        })
    })
    .config(function (ScoringServiceProvider, UserGoalsServiceProvider) {
        ScoringServiceProvider.setScoringLimits({
            exam: {
                min: 400,
                max: 1600
            },
            subjects: {
                min: 200,
                max: 800
            }
        });

        ScoringServiceProvider.setExamScoreFnGetter(function () {
            return function (scoresArr) {
                var totalScores = 0;
                angular.forEach(scoresArr, function (score) {
                    totalScores += score;
                });
                return totalScores;
            }
        });


        UserGoalsServiceProvider.settings = {
            updateGoalNum: 10,
            defaultSubjectScore: 600,
            subjects: [
                {name: 'math', svgIcon: 'math-section-icon'},
                {name: 'verbal', svgIcon: 'verbal-icon'}
            ]
        };
    })

    .config(function (EstimatedScoreSrvProvider, EstimatedScoreEventsHandlerSrvProvider, exerciseTypeConst) {
        var shouldEventBeProcessed;
        var subjectsRawScoreEdges = {
            0: {
                min: 0,
                max: 60
            },
            5: {
                min: 0,
                max: 85
            }
        };
        EstimatedScoreSrvProvider.setSubjectsRawScoreEdges(subjectsRawScoreEdges);

        EstimatedScoreSrvProvider.setRawScoreToRealScoreFn(function () {
            return function (subjectId, rawScore) {
                return rawScore * 3;
            };
        });

        var MIN_DIAGNOSTIC_SCORE = 0;
        var MAX_DIAGNOSTIC_SCORE = 1500;
        EstimatedScoreSrvProvider.setMinMaxDiagnosticScore(MIN_DIAGNOSTIC_SCORE, MAX_DIAGNOSTIC_SCORE);

        var diagnosticScoringMap = {
            1: [90, 90, 50, 50],
            2: [100, 100, 60, 60],
            3: [120, 120, 80, 80],
            4: [140, 140, 100, 100],
            5: [150, 150, 120, 120]
        };
        EstimatedScoreEventsHandlerSrvProvider.setDiagnosticScoring(diagnosticScoringMap);

        var sectionRawPoints = [1, 0, -0.25, 0];
        EstimatedScoreEventsHandlerSrvProvider.setExerciseRawPoints(exerciseTypeConst.SECTION, sectionRawPoints);

        var drillRawPoints = [0.2, 0, 0, 0];
        EstimatedScoreEventsHandlerSrvProvider.setExerciseRawPoints(exerciseTypeConst.DRILL, drillRawPoints);

        EstimatedScoreEventsHandlerSrvProvider.setEventProcessControl(function () {
            return function () {
                return angular.isDefined(shouldEventBeProcessed) ? shouldEventBeProcessed.apply(this, arguments) : true;
            };
        });
    })
    .decorator('DiagnosticSrv', function ($delegate, ExerciseStatusEnum, $q) {
        'ngInject';

        $delegate.getDiagnosticStatus = function () {
            return $q.when(ExerciseStatusEnum.COMPLETED.enum);
        };
        return $delegate;
    })
    .run(function ($rootScope, $translate, $translatePartialLoader, $state) {
        $rootScope.$on('$translatePartialLoaderStructureChanged', function () {
            $translate.refresh();
        });
    });
