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
   * @param acceptanceRange Optional acceptance rate range starting value (10 = 10-20%, 20 = 20-30%, etc.)
   * @returns A random problem matching the criteria or null if none found
   */
  public async getRandomProblem(difficulty?: string, topicSlug?: string, acceptanceRange?: number): Promise<Problem | null> {
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
      
      // For acceptance rate filtering, we need to fetch more problems and filter them by range
      if (acceptanceRange !== undefined) {
        const minAcceptanceRate = acceptanceRange;
        const maxAcceptanceRate = acceptanceRange + 10; // Each range is 10% (e.g., 10-20%, 20-30%, etc.)
        
        Logger.info(`Filtering for problems with acceptance rate between ${minAcceptanceRate}% and ${maxAcceptanceRate}%`);
        
        // We'll fetch a batch of problems and filter them by acceptance rate range
        // The GraphQL API doesn't support filtering by acceptance rate directly
        const batchSize = Math.min(100, totalProblems); // Don't fetch too many at once
        const randomSkip = Math.floor(Math.random() * (totalProblems - batchSize + 1));
        
        const response = await axios.post<ProblemListResponse>('https://leetcode.com/graphql/', {
          query: PROBLEM_QUERY,
          variables: {
            categorySlug: "",
            skip: randomSkip,
            limit: batchSize,
            filters: filters
          }
        });
        
        // Filter problems by acceptance rate range
        const filteredProblems = response.data.data.problemsetQuestionList.questions.filter(
          problem => problem.acRate >= minAcceptanceRate && problem.acRate < maxAcceptanceRate
        );
        
        if (filteredProblems.length === 0) {
          Logger.info(`No problems found with acceptance rate between ${minAcceptanceRate}% and ${maxAcceptanceRate}%`);
          return null;
        }
        
        // Pick a random problem from the filtered list
        const randomIndex = Math.floor(Math.random() * filteredProblems.length);
        return filteredProblems[randomIndex];
      } else {
        // If no acceptance rate filter, just get a single random problem
        const randomSkip = Math.floor(Math.random() * totalProblems);
              
        const response = await axios.post<ProblemListResponse>('https://leetcode.com/graphql/', {
          query: PROBLEM_QUERY,
          variables: {
            categorySlug: "",
            skip: randomSkip,
            limit: 1,
            filters: filters
          }
        });
              
        const problems = response.data.data.problemsetQuestionList.questions;
        return problems.length > 0 ? problems[0] : null;
      }
    } catch (error) {
      Logger.error(Logs.error.problemFetch, error);
      return null;
    }
  }
}