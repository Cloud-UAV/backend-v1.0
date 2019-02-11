var sequelize = require('../../sequelizeConnection');
var Sequelize=require('sequelize');


var ProjectComplianceFilesModel = sequelize.define('ProjectComplianceFiles', {
	name: {
		type: Sequelize.STRING
	},
	path: {
		type: Sequelize.STRING
	},
	uploadDate: {
		type: Sequelize.STRING
	},
	projectID: {
		type: Sequelize.INTEGER,
		references: 'Projects',
		referencesKey: 'id'
	},
	
},{
	timestamps: false,
	freezeTableName: true,
	// classMethods: {
 //        associate : function(models) {
 //        	console.log(models);
 //            ProjectModel.belongsTo(models.Users)
 //        },
 //      }
});

module.exports=ProjectComplianceFilesModel;