const GET_NODES_BY_PATH_QUERY = (
	path: string,
	userId: number,
	includeChildren: boolean = false
) => {
	const query = `
	WITH RECURSIVE
	  CTE AS (
	    SELECT
	      id,
	      name AS parent_path
	    FROM
	      nodes
	    WHERE
	      parentId IS NULL
	      AND userId = __userid
	    UNION ALL
	    SELECT
	      n.id,
	      parent_path || '/' || n.name
	    FROM
	      nodes n
	      JOIN CTE ON n.parentId = CTE.id
	  ) __includeChildren
	`;

	path = path === '/' ? 'root' : 'root' + path;

	return query
		.replace(/__path/g, `'${path}'`)
		.replace(/__userid/g, `${userId}`)
		.replace(
			/__includeChildren/g,
			includeChildren
				? `
				SELECT
				  *
				FROM
				  nodes
				WHERE
				  id = (
				    SELECT
				      id
				    FROM
				      CTE
				    WHERE
				      parent_path = __path
				  )
				  OR parentId = (
				    SELECT
				      id
				    FROM
				      CTE
				    WHERE
				      parent_path = __path
				  )`.replace(/__path/g, `'${path}'`)
				: `
				SELECT
				  *
				FROM
				  nodes
				WHERE
				  id = (
				    SELECT
				      id
				    FROM
				      CTE
				    WHERE
				      parent_path = __path
				  )`.replace(/__path/g, `'${path}'`)
		);
};

export { GET_NODES_BY_PATH_QUERY };
