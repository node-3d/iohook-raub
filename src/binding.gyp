{
	'variables': {
		'bin': '<!(node -p "require(\'addon-tools-raub\').getBin()")',
		'uio_include': '<!(node -p "require(\'deps-uiohook-raub\').include")',
		'uio_bin': '<!(node -p "require(\'deps-uiohook-raub\').bin")',
	},
	'targets': [{
		'target_name': 'iohook',
		'sources': [
			'cpp/bindings.cpp',
			'cpp/iohook.cpp',
			'cpp/hook-worker.cpp',
		],
		'include_dirs': [
			'<(uio_include)',
			'<!@(node -p "require(\'addon-tools-raub\').getInclude()")',
		],
		'cflags_cc': ['-std=c++17', '-fno-exceptions'],
		'cflags': ['-fno-exceptions'],
		'library_dirs': ['<(uio_bin)'],
		'conditions': [
			['OS=="linux"', {
				'cflags_cc': ['-w'],
				'libraries': [
					"-Wl,-rpath,'$$ORIGIN'",
					"-Wl,-rpath,'$$ORIGIN/../node_modules/deps-uiohook-raub/<(bin)'",
					"-Wl,-rpath,'$$ORIGIN/../../deps-uiohook-raub/<(bin)'",
					'-luiohook',
				],
				'defines': ['__linux__'],
			}],
			['OS=="mac"', {
				'cflags_cc': ['-w'],
				'libraries': [
					'-Wl,-rpath,@loader_path',
					'-Wl,-rpath,@loader_path/../node_modules/deps-uiohook-raub/<(bin)',
					'-Wl,-rpath,@loader_path/../../deps-uiohook-raub/<(bin)',
					'-luiohook',
				],
				'xcode_settings': {
					'DYLIB_INSTALL_NAME_BASE': '@rpath',
				},
				'MACOSX_DEPLOYMENT_TARGET': '10.9',
				'defines': ['__APPLE__'],
				'CLANG_CXX_LIBRARY': 'libc++',
				'OTHER_CFLAGS': ['-std=c++17', '-fno-exceptions'],
			}],
			['OS=="win"', {
				'libraries': [
					'-luiohook',
				],
				'defines': ['WIN32_LEAN_AND_MEAN', 'VC_EXTRALEAN', '_WIN32', '_HAS_EXCEPTIONS=0'],
				'msvs_settings' : {
					'VCCLCompilerTool' : {
						'AdditionalOptions' : [
							'/O2','/Oy','/GL','/GF','/Gm-', '/std:c++17',
							'/EHa-s-c-','/MT','/GS','/Gy','/GR-','/Gd',
						]
					},
					'VCLinkerTool' : {
						'AdditionalOptions' : ['/DEBUG:NONE', '/LTCG', '/OPT:NOREF'],
					},
				},
			}],
		],
	}]
}
