import axios from 'axios';
import { Logger } from './index.js';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
let Logs = require('../../lang/logs.json');

// Define types for GraphQL response
export interface ProblemTag {
  name: string;
  id?: string;
  slug?: string;
}

export interface Problem {
  acRate: number;
  difficulty: string;
  frontendQuestionId: string;
  paidOnly: boolean;
  title: string;
  titleSlug: string;
  topicTags: ProblemTag[];
}

interface ProblemListResponse {
  data: {
    problemsetQuestionList: {
      total: number;
      questions: Problem[];
    }
  }
}

// GraphQL query to fetch problem list
const PROBLEM_QUERY = `
query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
  problemsetQuestionList: questionList(
    categorySlug: $categorySlug
    limit: $limit
    skip: $skip
    filters: $filters
  ) {
    total: totalNum
    questions: data {
      acRate
      difficulty
      frontendQuestionId: questionFrontendId
      paidOnly: isPaidOnly
      title
      titleSlug
      topicTags {
        name
        id
        slug
      }
    }
  }
}`;

export class LeetCodeApi {
  /**
   * Fetches a random problem from LeetCode with optional filters
   * @param difficulty Optional difficulty filter (easy, medium, hard)
   * @param topicSlug Optional topic tag filter
   * @returns A random problem matching the criteria or null if none found
   */
  public async getRandomProblem(difficulty?: string, topicSlug?: string): Promise<Problem | null> {
    try {
      // Build filters object for GraphQL query
      const filters: any = {};
      if (difficulty) {
        filters.difficulty = difficulty.toUpperCase();
      }
      
      // Add topic tags to the filters if provided
      if (topicSlug) {
        filters.tags = [topicSlug];
      }
      
      Logger.info(`Fetching LeetCode problems with filters: ${JSON.stringify(filters)}`);
            
      // Fetch total count first to know the range
      const countResponse = await axios.post<ProblemListResponse>('https://leetcode.com/graphql/', {
        query: PROBLEM_QUERY,
        variables: {
          categorySlug: "", // Keep this empty, use tags filter instead
          skip: 0,
          limit: 1,
          filters: filters
        }
      });
            
      const totalProblems = countResponse.data.data.problemsetQuestionList.total;
      Logger.info(`Found ${totalProblems} problems matching the criteria`);
            
      if (totalProblems === 0) {
        return null;
      }
            
      // Generate random skip value
      const randomSkip = Math.floor(Math.random() * totalProblems);
            
      // Fetch a single random problem
      const response = await axios.post<ProblemListResponse>('https://leetcode.com/graphql/', {
        query: PROBLEM_QUERY,
        variables: {
          categorySlug: "", // Keep this empty, use tags filter instead
          skip: randomSkip,
          limit: 1,
          filters: filters
        }
      });
            
      const problems = response.data.data.problemsetQuestionList.questions;
      return problems.length > 0 ? problems[0] : null;
    } catch (error) {
      Logger.error(Logs.error.problemFetch, error);
      return null;
    }
  }
}