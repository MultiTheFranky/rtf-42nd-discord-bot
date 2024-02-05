import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Date: Date;
};

export type Arma3Attendance = {
  __typename?: 'Arma3Attendance';
  /** The attendance information */
  attendance: Array<Arma3AttendanceInfo>;
  /** The date of the attendance */
  date: Scalars['Date'];
};

export type Arma3AttendanceFilter = {
  /** The date to get attendance for */
  date: Scalars['Date'];
};

export type Arma3AttendanceInfo = {
  __typename?: 'Arma3AttendanceInfo';
  /** The name of the player */
  name: Scalars['String'];
  /** The attendance status of the player */
  status: Arma3AttendanceStatus;
};

export type Arma3AttendanceInfoInput = {
  /** The name of the player */
  name: Scalars['String'];
  /** The attendance status of the player */
  status: Arma3AttendanceStatus;
};

export type Arma3AttendanceInput = {
  /** The attendance information */
  attendance: Array<Arma3AttendanceInfoInput>;
  /** The date to add attendance for */
  date: Scalars['Date'];
};

export enum Arma3AttendanceStatus {
  /** The player attended */
  Attended = 'ATTENDED',
  /** The player did not attend */
  DidNotAttend = 'DID_NOT_ATTEND',
  /** The player was excused */
  Excused = 'EXCUSED',
  /** The player was late */
  Late = 'LATE'
}

export type Mutation = {
  __typename?: 'Mutation';
  /** Add Arma 3 attendance information */
  addArma3Attendance?: Maybe<Arma3Attendance>;
  empty: Scalars['String'];
};


export type MutationAddArma3AttendanceArgs = {
  input: Arma3AttendanceInput;
};

export type Query = {
  __typename?: 'Query';
  empty: Scalars['String'];
  /** Get Arma 3 attendance information */
  getArma3Attendance: Arma3Attendance;
};


export type QueryGetArma3AttendanceArgs = {
  filter: Arma3AttendanceFilter;
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Arma3Attendance: ResolverTypeWrapper<Arma3Attendance>;
  Arma3AttendanceFilter: Arma3AttendanceFilter;
  Arma3AttendanceInfo: ResolverTypeWrapper<Arma3AttendanceInfo>;
  Arma3AttendanceInfoInput: Arma3AttendanceInfoInput;
  Arma3AttendanceInput: Arma3AttendanceInput;
  Arma3AttendanceStatus: Arma3AttendanceStatus;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  Date: ResolverTypeWrapper<Scalars['Date']>;
  Mutation: ResolverTypeWrapper<{}>;
  Query: ResolverTypeWrapper<{}>;
  String: ResolverTypeWrapper<Scalars['String']>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Arma3Attendance: Arma3Attendance;
  Arma3AttendanceFilter: Arma3AttendanceFilter;
  Arma3AttendanceInfo: Arma3AttendanceInfo;
  Arma3AttendanceInfoInput: Arma3AttendanceInfoInput;
  Arma3AttendanceInput: Arma3AttendanceInput;
  Boolean: Scalars['Boolean'];
  Date: Scalars['Date'];
  Mutation: {};
  Query: {};
  String: Scalars['String'];
};

export type Arma3AttendanceResolvers<ContextType = any, ParentType extends ResolversParentTypes['Arma3Attendance'] = ResolversParentTypes['Arma3Attendance']> = {
  attendance?: Resolver<Array<ResolversTypes['Arma3AttendanceInfo']>, ParentType, ContextType>;
  date?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Arma3AttendanceInfoResolvers<ContextType = any, ParentType extends ResolversParentTypes['Arma3AttendanceInfo'] = ResolversParentTypes['Arma3AttendanceInfo']> = {
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['Arma3AttendanceStatus'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface DateScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Date'], any> {
  name: 'Date';
}

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  addArma3Attendance?: Resolver<Maybe<ResolversTypes['Arma3Attendance']>, ParentType, ContextType, RequireFields<MutationAddArma3AttendanceArgs, 'input'>>;
  empty?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  empty?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  getArma3Attendance?: Resolver<ResolversTypes['Arma3Attendance'], ParentType, ContextType, RequireFields<QueryGetArma3AttendanceArgs, 'filter'>>;
};

export type Resolvers<ContextType = any> = {
  Arma3Attendance?: Arma3AttendanceResolvers<ContextType>;
  Arma3AttendanceInfo?: Arma3AttendanceInfoResolvers<ContextType>;
  Date?: GraphQLScalarType;
  Mutation?: MutationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
};

